
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import { MailService } from "../mail/mail.service.js";
import Stripe from "stripe";

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY não configurada");

    this.stripe = new Stripe(key);
  }

  // CRIAR PAGAMENTO
  async createPayment(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });

    if (!order) throw new NotFoundException("Pedido não encontrado");
    if (order.userId !== userId) throw new ForbiddenException("Você não pode pagar este pedido");
    if (order.status !== "PENDENTE") throw new BadRequestException("Pedido indisponível para pagamento");
    if (order.payments.some(p => p.status === "APROVADO")) throw new BadRequestException("Pedido já pago");
    if (!order.items.length) throw new BadRequestException("Pedido sem produtos");

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) throw new InternalServerErrorException("FRONTEND_URL não configurada");

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      line_items: order.items.map(item => {
        const price = Number(item.unitPrice);
        if (!Number.isFinite(price) || price <= 0)
          throw new BadRequestException("Preço inválido");

        return {
          price_data: {
            currency: "brl",
            product_data: { name: item.productName },
            unit_amount: Math.round(price * 100),
          },
          quantity: item.quantity,
        };
      }),
      metadata: { orderId: order.id },
      success_url: `${frontendUrl}/pedido/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pedido/cancelado`,
    });

    if (!session.url)
      throw new InternalServerErrorException("Não foi possível gerar o pagamento");

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        stripeSessionId: session.id,
        amount: Math.round(Number(order.total) * 100),
        currency: "brl",
        status: "PENDENTE",
      },
    });

    return {
      message: "Pagamento criado com sucesso",
      checkoutUrl: session.url,
      sessionId: session.id,
      payment,
    };
  }

  // CONSULTAR PAGAMENTO
  async buscarPagamento(id: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) throw new NotFoundException("Pagamento não encontrado");
    if (payment.order.userId !== userId)
      throw new ForbiddenException("Você não tem permissão para consultar este pagamento");

    return payment;
  }

  // WEBHOOK DO STRIPE
  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET não configurada");

    const event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    console.log("WEBHOOK RECEBIDO:", event.type);

    // PAGAMENTO APROVADO
    if ([
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
    ].includes(event.type)) {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid")
        return { received: true };

      const payment = await this.prisma.payment.findUnique({
        where: { stripeSessionId: session.id },
      });

      if (!payment)
        throw new NotFoundException("Pagamento não encontrado");

      await this.prisma.$transaction(async tx => {
        await tx.payment.updateMany({
          where: { id: payment.id, status: "PENDENTE" },
          data: {
            status: "APROVADO",
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id,
          },
        });

        const atual = await tx.payment.findUnique({
          where: { id: payment.id },
        });

        if (atual?.status !== "APROVADO")
          throw new BadRequestException("Pagamento não confirmado no banco");

        await tx.order.updateMany({
          where: { id: payment.orderId, status: { not: "PAGO" } },
          data: { status: "PAGO" },
        });
      });

      // BUSCAR PEDIDO E CLIENTE
      const pedido = await this.prisma.order.findUnique({
        where: { id: payment.orderId },
        include: { user: true, items: true },
      });

      if (!pedido) throw new NotFoundException("Pedido não encontrado");
      if (!pedido.user.email) throw new BadRequestException("Cliente sem e-mail cadastrado");

      // ENVIAR E-MAIL DE COMPRA
      await this.mailService.enviarCompra({
        pedidoId: pedido.id,
        email: pedido.user.email,
        nome: pedido.user.name,
        produto: pedido.items.map(i => `${i.productName} (${i.quantity}x)`).join(", "),
        quantidade: pedido.items.reduce((total, i) => total + i.quantity, 0),
        total: `R$ ${Number(pedido.total).toFixed(2).replace(".", ",")}`,
      });

      console.log("E-MAIL DE COMPRA ADICIONADO À FILA!");
    }

    // PAGAMENTO RECUSADO OU EXPIRADO
    if ([
      "checkout.session.async_payment_failed",
      "checkout.session.expired",
    ].includes(event.type)) {
      const session = event.data.object as Stripe.Checkout.Session;

      const payment = await this.prisma.payment.findUnique({
        where: { stripeSessionId: session.id },
      });

      if (payment?.status === "PENDENTE") {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: "RECUSADO" },
        });
      }
    }

    return { received: true };
  }
}

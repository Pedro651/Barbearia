
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    InternalServerErrorException
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import Stripe from "stripe";

@Injectable()
export class PaymentService {

    private stripe: Stripe;

    constructor(
        private prisma: PrismaService
    ) {
        const secretKey = process.env.STRIPE_SECRET_KEY;

        if (!secretKey) {
            throw new Error("STRIPE_SECRET_KEY não configurada");
        }

        this.stripe = new Stripe(secretKey);
    }

    // CRIAR PAGAMENTO
    async createPayment(orderId: string, userId: string) {

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
                payments: true
            }
        });

        if (!order) {
            throw new NotFoundException("Pedido não encontrado");
        }

        if (order.userId !== userId) {
            throw new ForbiddenException(
                "Você não pode pagar este pedido"
            );
        }

        if (order.status !== "PENDENTE") {
            throw new BadRequestException(
                "Este pedido não está disponível para pagamento"
            );
        }

        const pagamentoAprovado = order.payments.some(
            payment => payment.status === "APROVADO"
        );

        if (pagamentoAprovado) {
            throw new BadRequestException(
                "Este pedido já foi pago"
            );
        }

        if (!order.items.length) {
            throw new BadRequestException(
                "Este pedido não possui produtos"
            );
        }

        const frontendUrl = process.env.FRONTEND_URL;

        if (!frontendUrl) {
            throw new InternalServerErrorException(
                "FRONTEND_URL não configurada"
            );
        }

        // Criar sessão de pagamento no Stripe
        const session = await this.stripe.checkout.sessions.create({

            mode: "payment",

            line_items: order.items.map(item => {

                const price = Number(item.unitPrice);

                if (!Number.isFinite(price) || price <= 0) {
                    throw new BadRequestException(
                        "Preço de produto inválido"
                    );
                }

                return {
                    price_data: {
                        currency: "brl",

                        product_data: {
                            name: item.productName
                        },

                        unit_amount: Math.round(price * 100)
                    },

                    quantity: item.quantity
                };
            }),

            metadata: {
                orderId: order.id
            },

            success_url:
                `${frontendUrl}/pedido/sucesso?session_id={CHECKOUT_SESSION_ID}`,

            cancel_url:
                `${frontendUrl}/pedido/cancelado`
        });

        if (!session.url) {
            throw new InternalServerErrorException(
                "Não foi possível gerar o link de pagamento"
            );
        }

        // Salvar pagamento no banco
        const payment = await this.prisma.payment.create({
            data: {
                orderId: order.id,
                stripeSessionId: session.id,
                amount: Math.round(Number(order.total) * 100),
                currency: "brl",
                status: "PENDENTE"
            }
        });

        return {
            message: "Pagamento criado com sucesso",
            checkoutUrl: session.url,
            sessionId: session.id,
            payment
        };
    }

    // CONSULTAR PAGAMENTO
    async buscarPagamento(id: string, userId: string) {

        const payment = await this.prisma.payment.findUnique({
            where: { id },

            include: {
                order: true
            }
        });

        if (!payment) {
            throw new NotFoundException(
                "Pagamento não encontrado"
            );
        }

        if (payment.order.userId !== userId) {
            throw new ForbiddenException(
                "Você não tem permissão para consultar este pagamento"
            );
        }

        return payment;
    }

    // RECEBER WEBHOOK DO STRIPE
    async handleWebhook(rawBody: Buffer, signature: string) {

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            throw new Error(
                "STRIPE_WEBHOOK_SECRET não configurada"
            );
        }

        // Validar assinatura
        const event = this.stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret
        );

        // PAGAMENTO APROVADO
        if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
        ) {

            const session = event.data.object as Stripe.Checkout.Session;

            if (session.payment_status !== "paid") {
                return { received: true };
            }

            const payment = await this.prisma.payment.findUnique({
                where: {
                    stripeSessionId: session.id
                }
            });

            if (!payment) {
                throw new NotFoundException(
                    "Pagamento não encontrado"
                );
            }

            // Atualizar pagamento e pedido juntos
            await this.prisma.$transaction(async (tx) => {

                await tx.payment.update({
                    where: {
                        id: payment.id
                    },

                    data: {
                        status: "APROVADO",

                        stripePaymentIntentId:
                            typeof session.payment_intent === "string"
                                ? session.payment_intent
                                : session.payment_intent?.id
                    }
                });

                await tx.order.update({
                    where: {
                        id: payment.orderId
                    },

                    data: {
                        status: "PAGO"
                    }
                });

            });
        }

        // PAGAMENTO FALHOU OU SESSÃO EXPIROU
        if (
            event.type === "checkout.session.async_payment_failed" ||
            event.type === "checkout.session.expired"
        ) {

            const session = event.data.object as Stripe.Checkout.Session;

            const payment = await this.prisma.payment.findUnique({
                where: {
                    stripeSessionId: session.id
                }
            });

            if (payment && payment.status === "PENDENTE") {

                await this.prisma.payment.update({
                    where: {
                        id: payment.id
                    },

                    data: {
                        status: "RECUSADO"
                    }
                });
            }
        }

        return {
            received: true
        };
    }
}

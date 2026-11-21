import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";



@Injectable()
export class StatisticsService{
    // Injeta o Prisma para acessar o banco de dados
    constructor(private prisma: PrismaService) {}

    // Gera o resumo geral das vendas
    async overview(tokenPayload: PAyloadTOkenDto) {

        // Permite acesso somente para administradores
        if (tokenPayload.role !== "ADMIN") {
            throw new ForbiddenException("Apenas administradores podem acessar as estatísticas");
        }

        // Executa as quatro consultas ao mesmo tempo
        const [totalOrders, paidOrders, pendingOrders, totalRevenue] =
            await Promise.all([

                // Conta todos os pedidos
                this.prisma.order.count(),

                // Conta somente os pedidos pagos
                this.prisma.order.count({
                    where: { status: "PAGO" }
                }),

                // Conta somente os pedidos pendentes
                this.prisma.order.count({
                    where: { status: "PENDENTE" }
                }),

                // Soma o valor total dos pedidos pagos
                this.prisma.order.aggregate({
                    where: { status: "PAGO" },
                    _sum: { total: true }
                })
            ]);

        // Retorna os resultados para o frontend
        return {
            totalOrders,
            paidOrders,
            pendingOrders,

            // Converte o resultado para número; se não houver vendas, retorna 0
            totalRevenue: Number(totalRevenue._sum.total ?? 0)
        };
    }

    // Calcula o faturamento entre duas datas

async revenue(
    startDate: string,
    endDate: string,
    tokenPayload: PAyloadTOkenDto
) {
    // Somente administradores podem acessar
    if (tokenPayload.role !== "ADMIN") {
        throw new ForbiddenException(
            "Apenas administradores podem acessar as estatísticas"
        );
    }

    // Define o período em UTC
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    // Busca os pedidos pagos dentro do período
    const paidOrders = await this.prisma.order.findMany({
        where: {
            status: "PAGO",
            createdAt: {
                gte: start,
                lte: end
            }
        },
        select: {
            createdAt: true,
            total: true
        }
    });

    // Agrupa o faturamento por dia
    const dailyTotals = new Map<string, number>();

    for (const order of paidOrders) {
        const date = order.createdAt.toISOString().slice(0, 10);

        const currentValue = dailyTotals.get(date) ?? 0;

        dailyTotals.set(
            date,
            currentValue + Number(order.total)
        );
    }

    // Cria uma lista com todos os dias do período,
    // inclusive aqueles em que não houve vendas
    const dailyRevenue = [];

    const currentDate = new Date(startDate + "T00:00:00.000Z");
    const finalDate = new Date(endDate + "T00:00:00.000Z");

    while (currentDate <= finalDate) {
        const date = currentDate.toISOString().slice(0, 10);

        dailyRevenue.push({
            date,
            revenue: dailyTotals.get(date) ?? 0
        });

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // Calcula o faturamento total
    const totalRevenue = paidOrders.reduce(
        (total, order) => total + Number(order.total),
        0
    );

    return {
        startDate,
        endDate,
        totalRevenue,
        dailyRevenue
    };
}


// Conta os pedidos realizados dentro de um período
async orders(
    startDate: string,
    endDate: string,
    tokenPayload: PAyloadTOkenDto
) {
    // Permite acesso somente para administradores
    if (tokenPayload.role !== "ADMIN") {
        throw new ForbiddenException("Apenas administradores podem acessar as estatísticas");
    }

    // Define a data inicial e final
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    // Conta os pedidos criados dentro do período
    const totalOrders = await this.prisma.order.count({
        where: {
            createdAt: {
                gte: start, // Data maior ou igual ao início
                lte: end    // Data menor ou igual ao fim
            }
        }
    });

    // Retorna a quantidade encontrada
    return {
        startDate,
        endDate,
        totalOrders
    };
}
// Busca os produtos mais vendidos
async products(tokenPayload: PAyloadTOkenDto) {

    // Permite acesso somente para administradores
    if (tokenPayload.role !== "ADMIN") {
        throw new ForbiddenException("Apenas administradores podem acessar as estatísticas");
    }

    // Busca os itens dos pedidos pagos e agrupa por produto
    const products = await this.prisma.orderItem.groupBy({
        by: ["productId", "productName"],

        where: {
            order: {
                status: "PAGO"
            }
        },

        // Soma a quantidade vendida de cada produto
        _sum: {
            quantity: true
        },

        // Ordena do mais vendido para o menos vendido
        orderBy: {
            _sum: {
                quantity: "desc"
            }
        },

        // Retorna somente os 10 mais vendidos
        take: 10
    });

    // Organiza os resultados para o frontend
    return products.map(product => ({
        productId: product.productId,
        productName: product.productName,
        quantitySold: product._sum.quantity ?? 0
    }));
}
// Busca as estatísticas dos pagamentos
async payments(tokenPayload: PAyloadTOkenDto) {

    // Permite acesso somente para administradores
    if (tokenPayload.role !== "ADMIN") {
        throw new ForbiddenException("Apenas administradores podem acessar as estatísticas");
    }

    // Executa as consultas ao mesmo tempo
    const statistics = await Promise.all([

        // Conta os pagamentos aprovados
        this.prisma.payment.count({
            where: { status: "APROVADO" }
        }),

        // Conta os pagamentos pendentes
        this.prisma.payment.count({
            where: { status: "PENDENTE" }
        }),

        // Conta os pagamentos recusados
        this.prisma.payment.count({
            where: { status: "RECUSADO" }
        }),

        // Soma o valor dos pagamentos aprovados
        this.prisma.payment.aggregate({
            where: { status: "APROVADO" },
            _sum: { amount: true }
        })
    ]);

    // Retorna as estatísticas
    return {
        approvedPayments: statistics[0],
        pendingPayments: statistics[1],
        refusedPayments: statistics[2],

        // Converte de centavos para reais
        totalReceived: Number(statistics[3]._sum.amount ?? 0) / 100
    };
}

}

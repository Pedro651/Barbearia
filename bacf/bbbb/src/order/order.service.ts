import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateOrderDto } from "./dto/create-order.dto.js";
import { PaginationsOrderDto } from "./dto/list-order.dto.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { UpdateOrderStatusDto } from "./dto/update-status.dto.js";


@Injectable()
export class OrderService{
    constructor(private prisma: PrismaService) {}
    
    
    async createOrder(createOrderDto: CreateOrderDto, userId: string) {
        
        
        // 1. Buscar os produtos no banco
        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: createOrderDto.items.map(item => item.productId)
                }
            }
        });

        // 2. Verificar se todos os produtos existem
        if (products.length !== new Set(createOrderDto.items.map(item => item.productId)).size) {
            throw new NotFoundException('Um ou mais produtos não foram encontrados');
        }

        // 3. Calcular o total
        const total = createOrderDto.items.reduce((sum, item) => {
            const product = products.find(p => p.id === item.productId)!;

            return sum + Number(product.price) * item.quantity;
        }, 0);

        // 4. Criar pedido e seus produtos
        const order = await this.prisma.order.create({
            data: {
                userId,
                total,

                items: {
                    create: createOrderDto.items.map(item => {
                        const product = products.find(p => p.id === item.productId)!;

                        return {
                            productId: product.id,
                            productName: product.name,
                            quantity: item.quantity,
                            unitPrice: product.price
                        };
                    })
                }
            },
            include: {
                items: true
            }
        });

        return order;
    }

    async listOrder(listOrderDto:PaginationsOrderDto,tokenPayload: PAyloadTOkenDto){

    if (tokenPayload.role !== 'ADMIN') {
    throw new ForbiddenException(
        'Somente administradores podem listar todos os pedidos'
    );
    }
        
    const { limit = 10, offset = 0 } = listOrderDto;
    

    return this.prisma.order.findMany({
        take: limit,
        skip: offset,
        include: {
            items: true,
            payments: true,
            user: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    }

    async listUser(userId: string){

        return this.prisma.order.findMany({
            where:{
                userId
            },
            include:{
                items: true,
                payments: true
            },
            orderBy: {
            createdAt: 'desc'
            }
        })

    }

    async buscarPedido(id: string, userId: string) {
    const getPedido = await this.prisma.order.findFirst({
        where: {
            id,
            userId
        },
        include: {
            items: true,
            payments: true
        }
    });

    if (!getPedido) {
        throw new NotFoundException('Pedido não encontrado');
    }

    return getPedido;
}

    async updateOrderStatus( id: string,updateOrderStatusDto: UpdateOrderStatusDto,tokenPayload: PAyloadTOkenDto ){
        if (tokenPayload.role !== 'ADMIN') {
        throw new ForbiddenException(
            'Somente administradores podem atualizar o status'
        );
    }

     const order = await this.prisma.order.findUnique({
        where: { id }
    });

    if (!order) {
        throw new NotFoundException('Pedido não encontrado');
    }

    return this.prisma.order.update({
    where: { id },
    data: {
        status: updateOrderStatusDto.status
    }
    });
    }


    async cancelOrder(id: string,tokenPayload: PAyloadTOkenDto){
    if (tokenPayload.role !== 'ADMIN') {
        throw new ForbiddenException(
            'Somente administradores podem cancelar pedidos'
        );
    }

        const order = await this.prisma.order.findUnique({
        where: { id }
    });

    if (!order) {
        throw new NotFoundException('Pedido não encontrado');
    }

    return this.prisma.order.update({
        where: { id },
        data: {
            status: 'CANCELADO'
        }
    });
    }


}
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { OrderController } from "./order.controller.js";
import { OrderService } from "./order.service.js";



@Module({
    imports:[PrismaModule],
    controllers:[OrderController],
    providers:[OrderService]

})

export class OrderModule {}
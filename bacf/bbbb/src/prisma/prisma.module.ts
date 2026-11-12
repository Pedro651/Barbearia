import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";


@Module({
    providers:[PrismaService],
    //exports: Faz com que o prismaService seja importado pelo outro modulo
    exports: [PrismaService]
})
export class PrismaModule {}

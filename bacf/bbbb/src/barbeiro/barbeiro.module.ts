import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { BarbeiroController } from "./barbeiro.controller.js";
import { BarbeiroService } from "./barbeiro.service.js";


@Module({
    imports:[PrismaModule],
    controllers:[BarbeiroController],
    providers:[BarbeiroService]

})

export class BarbeiroModule {}
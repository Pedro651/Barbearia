import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { HorarioController } from "./horario.controller.js";
import { HorarioService } from "./horario.service.js";


@Module({
    imports:[PrismaModule],
    controllers:[HorarioController],
    providers:[HorarioService]

})

export class HorarioModule {}
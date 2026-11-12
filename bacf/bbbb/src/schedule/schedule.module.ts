import { Module } from "@nestjs/common";
import { ScheduleService } from "./schedule.service.js";
import { ScheduleController } from "./schedule.controller.js";
import { PrismaModule } from "../prisma/prisma.module.js";


@Module({
    imports:[PrismaModule],
    controllers:[ScheduleController],
    providers:[ScheduleService]

})

export class ScheduleModule {}
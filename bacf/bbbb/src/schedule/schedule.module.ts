import { Module } from "@nestjs/common";
import { ScheduleService } from "./schedule.service.js";
import { ScheduleController } from "./schedule.controller.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { MailModule } from "../mail/mail.module.js";


@Module({
    imports:[PrismaModule,MailModule],
    controllers:[ScheduleController],
    providers:[ScheduleService]

})

export class ScheduleModule {}
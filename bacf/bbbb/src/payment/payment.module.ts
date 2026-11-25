import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { PaymenteController } from "./payment.controller.js";
import { PaymentService } from "./payment.service.js";
import { MailModule } from "../mail/mail.module.js";




@Module({
    imports:[PrismaModule, MailModule],
    controllers:[PaymenteController],
    providers:[PaymentService]

})

export class PaymenteModule {}
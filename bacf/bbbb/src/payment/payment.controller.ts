
import {
    Controller,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
    Headers,
    BadRequestException
} from "@nestjs/common";

import { PaymentService } from "./payment.service.js";
import { TokenPayloadParam } from "../auth/param/token-payload.param.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { AuthTokenGard } from "../auth/guard/auth-token.guard.js";

import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";

@Controller("payment")
export class PaymenteController {

    constructor(
        private readonly paymentService: PaymentService
    ) {}

    @UseGuards(AuthTokenGard)
    @Post("create/:orderId")
    createPayment(
        @Param("orderId") orderId: string,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ) {
        // Solicita a criação do pagamento para o pedido
        return this.paymentService.createPayment(
            orderId,
            tokenPayload.sub
        );
    }

    @UseGuards(AuthTokenGard)
    @Get(":id")
    buscarPagamento(
        @Param("id") id: string,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ) {
        // Busca o pagamento pelo ID e pelo usuário.
        return this.paymentService.buscarPagamento(
            id,
            tokenPayload.sub
        );
    }

    //Webhook: é uma forma de um sistema avisar automaticamente outro sistema quando acontece alguma coisa.
    @Post("webhook")
    webhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers("stripe-signature") signature: string
    ) {
        if (!req.rawBody || !signature) {
            throw new BadRequestException(
                "Corpo ou assinatura do Stripe ausente"
            );
        }

        return this.paymentService.handleWebhook(
            req.rawBody,
            signature
        );
    }
}

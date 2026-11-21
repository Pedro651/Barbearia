
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { StatisticsService } from "./statistics.service.js";
import { TokenPayloadParam } from "../auth/param/token-payload.param.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { AuthTokenGard } from "../auth/guard/auth-token.guard.js";


@Controller("statistics")
@UseGuards(AuthTokenGard)
export class StatisticsController {
    constructor(private statisticsService: StatisticsService) {}

    // Resumo geral das vendas
    @Get("overview")
    async overview(
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ) {
        return this.statisticsService.overview(tokenPayload);
    }

    // Faturamento por período
    @Get("revenue")
    async revenue(
        @Query("startDate") startDate: string,
        @Query("endDate") endDate: string,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ) {
        return this.statisticsService.revenue(startDate, endDate, tokenPayload);
    }

    // Quantidade de pedidos por período
    @Get("orders")
    async orders(
        @Query("startDate") startDate: string,
        @Query("endDate") endDate: string,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ) {
        return this.statisticsService.orders(startDate, endDate, tokenPayload);
    }

    // Produtos mais vendidos
    @Get("products")
    async products(
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ) {
        return this.statisticsService.products(tokenPayload);
    }

    // Estatísticas dos pagamentos
    @Get("payments")
    async payments(
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ) {
        return this.statisticsService.payments(tokenPayload);
    }
}

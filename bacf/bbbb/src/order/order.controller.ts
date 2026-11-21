import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AuthTokenGard } from "../auth/guard/auth-token.guard.js";
import { OrderService } from "./order.service.js";
import { CreateOrderDto } from "./dto/create-order.dto.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { TokenPayloadParam } from "../auth/param/token-payload.param.js";
import { PaginationsOrderDto } from "./dto/list-order.dto.js";
import { UpdateOrderStatusDto } from "./dto/update-status.dto.js";

@Controller('order')
export class OrderController{

    constructor(private readonly orderService: OrderService){}

    @UseGuards(AuthTokenGard)
    @Post('create')
    createOrder(
        @Body() CreateOrderDto: CreateOrderDto,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    ){
        return this.orderService.createOrder(CreateOrderDto,tokenPayload.sub);
    }

    @UseGuards(AuthTokenGard)
    @Get('list')
    listOrder(
        @Query() listOrderDto:PaginationsOrderDto,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    ){
        return this.orderService.listOrder(listOrderDto,tokenPayload)
    }


    @UseGuards(AuthTokenGard)
    @Get('me')
    listUser(
    @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    ){
      return this.orderService.listUser(tokenPayload.sub)
    }


    @UseGuards(AuthTokenGard)
    @Get(':id')
    buscarOrder(
        @Param('id') id: string,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ) {
        return this.orderService.buscarPedido(id, tokenPayload.sub);
    }

    @UseGuards(AuthTokenGard)
    @Patch(':id/status')
    updateOrderS(
        @Param('id') id: string,
          @Body() updateOrderStatusDto: UpdateOrderStatusDto,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ){
         return this.orderService.updateOrderStatus(
        id,
        updateOrderStatusDto,
        tokenPayload
    );

    }


    @UseGuards(AuthTokenGard)
    @Delete(':id')
    canceleOrder(
        @Param('id') id: string,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto
    ){
         return this.orderService.cancelOrder(id,tokenPayload);
    }

}
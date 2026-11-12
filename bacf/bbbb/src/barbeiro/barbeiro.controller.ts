import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { BarbeiroService } from "./barbeiro.service.js";
import { AuthTokenGard } from "../auth/guard/auth-token.guard.js";
import { CortesDto } from "./dto/cortes.Dto.js";
import { TokenPayloadParam } from "../auth/param/token-payload.param.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { ListBarberDto } from "./dto/listbarbe.dto.js";




@Controller('cortes')
export class BarbeiroController{

    constructor( private readonly cortesService: BarbeiroService){}

    @UseGuards(AuthTokenGard)
    @Post('barbeiroo')
    createBarber(
        @Body()  cortesDto:CortesDto,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    ){
        return this.cortesService.createBarber(tokenPayload, cortesDto);
    }

    @UseGuards(AuthTokenGard)
    @Patch(':id')
    editBarber(
        @Param('id') id: string,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
        @Body() cortesDto: CortesDto,
    ){
        return this.cortesService.editBarber(tokenPayload, id,cortesDto );
    }


    @UseGuards(AuthTokenGard)
    @Delete(':id')
    deleteBarber(
        @Param('id') id: string,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    ){
        return this.cortesService.deleteBarber(tokenPayload, id);
    }

     @UseGuards(AuthTokenGard)
        @Get('varios')
        listAgendaTotal(
        @Query() paginationtsDto: ListBarberDto, ){
        return this.cortesService.listBarberAgendas(paginationtsDto)
        }

}


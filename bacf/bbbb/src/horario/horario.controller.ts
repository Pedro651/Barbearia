import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { HorarioService } from "./horario.service.js";
import { AuthTokenGard } from "../auth/guard/auth-token.guard.js";
import { TokenPayloadParam } from "../auth/param/token-payload.param.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { HorarioDto } from "./dto/horario.dto.js";
import { ListserverDto } from "../servico/dto/listserver.dto.js";
import { ListhourDto } from "./dto/listhour.dto.js";


@Controller('horario')
export class HorarioController{

    constructor( private readonly horaService: HorarioService){}


    @UseGuards(AuthTokenGard)
    @Post('hora')
    createHorario(
    @Body()  horario:HorarioDto,
    @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    ){
        return this.horaService.createHorario(horario,tokenPayload)
        
    }


    @UseGuards(AuthTokenGard)
    @Patch(':id')
    editHorario(
        @Param('id') id: string,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
        @Body() horario: HorarioDto,
    ){
        return this.horaService.editHorario(id, horario, tokenPayload);
    }



      @UseGuards(AuthTokenGard)
        @Delete(':id')
        deleteHora(
            @Param('id') id: string,
            @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
        ){
            return this.horaService.deleteHorario(tokenPayload, id);
        
    }

    @UseGuards(AuthTokenGard)
    @Get('varios')
    listAgendaTotal(
    @Query() paginationtsDto: ListhourDto, ){
    return this.horaService.listHourAgendas(paginationtsDto)
    }


}
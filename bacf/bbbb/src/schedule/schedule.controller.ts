import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ScheduleService } from "./schedule.service.js";
import { AuthTokenGard } from "../auth/guard/auth-token.guard.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { TokenPayloadParam } from "../auth/param/token-payload.param.js";
import { CreateScheduleDto } from "./dto/schedule.dto.js";
import { PaginationsDto } from "./dto/paginationsDto.js";



@Controller('schedule')
export class ScheduleController{
    
    constructor (private readonly scheduleHair : ScheduleService) {}


    @UseGuards(AuthTokenGard)
   @Post()
 newSchedule(
  @Body() createSchedule: CreateScheduleDto,
  @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
) {
  return this.scheduleHair.createSchedule(
    createSchedule,
    tokenPayload,
  );
}

    @UseGuards(AuthTokenGard)
    @Get('buscar')
    getAllSchedules(@TokenPayloadParam() tokenPayload: PAyloadTOkenDto,){
        return this.scheduleHair.listSchedules(tokenPayload);
    }

    @UseGuards(AuthTokenGard)
    @Delete(':id')
    deleteSchedule(
        @Param('id') id: string,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    ){
        return this.scheduleHair.deleteService(id, tokenPayload);

    }

    @UseGuards(AuthTokenGard)
    @Get('varios')
    listAgendaTotal(
        @Query() paginationtsDto: PaginationsDto, ){
            return this.scheduleHair.listAgendas(paginationtsDto)
    }


    @UseGuards(AuthTokenGard)
    @Patch(':id')
    statusSchedule(
    @Param('id') id: string,
    @Body('status') status: string,
    @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    ) {
    return this.scheduleHair.statusAtuali(
        id,
        status,
        tokenPayload,
    );
    }

}
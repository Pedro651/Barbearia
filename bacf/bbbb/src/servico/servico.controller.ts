import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ServicoService } from './servico.service.js';
import { AuthTokenGard } from '../auth/guard/auth-token.guard.js';
import { TokenPayloadParam } from '../auth/param/token-payload.param.js';
import { PAyloadTOkenDto } from '../auth/dto/payload-token.dto.js';
import { ServicoDto } from './dto/servi.dto.js';
import { ListserverDto } from './dto/listserver.dto.js';


@Controller('servicos')
export class ServicoController {
  constructor(private readonly serviceService: ServicoService) {}
  
      @UseGuards(AuthTokenGard)
      @Post('server')
      createServico(
          @Body()  cortesDto:ServicoDto,
          @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
      ){
          return this.serviceService.createServico(tokenPayload, cortesDto);
      }
  
      @UseGuards(AuthTokenGard)
      @Patch(':id')
      editServico(
          @Param('id') id: string,
          @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
          @Body() cortesDto: ServicoDto,
      ){
          return this.serviceService.editServico(tokenPayload, id,cortesDto );
      }
  
  
      @UseGuards(AuthTokenGard)
      @Delete(':id')
      deleteBarber(
          @Param('id') id: string,
          @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
      ){
          return this.serviceService.deleteServico(tokenPayload, id);
      }

      @UseGuards(AuthTokenGard)
      @Get('varios')
      listAgendaTotal(
      @Query() paginationtsDto: ListserverDto, ){
      return this.serviceService.listServeAgendas(paginationtsDto)
      }
  
  
  
  
}

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateScheduleDto } from "./dto/schedule.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { PaginationsDto } from "./dto/paginationsDto.js";


@Injectable()
export class ScheduleService{

    constructor(private prisma : PrismaService){}


  
async createSchedule(
  createSchedule: CreateScheduleDto,
  tokenPayload: PAyloadTOkenDto,
) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: tokenPayload.sub,
    },
  });

  if (!user) {
    throw new HttpException(
      'Usuário não existe',
      HttpStatus.NOT_FOUND,
    );
  }

  return this.prisma.servicoAgendado.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },

      horario: {
        connect: {
          id: createSchedule.horarioId,
        },
      },

      date: new Date(createSchedule.date),
      hour: createSchedule.hour,

      barbeiro: {
        connect: {
          id: createSchedule.barbeiro,
        },
      },

      servico: {
        connect: {
          id: createSchedule.servico,
        },
      },
    },

    select: {
      id: true,
      user_id: true,
      date: true,
      hour: true,
      status: true,
      barbeiro: true,
      servico: true,
      horario: true,
    },
  });
}

    //Pega de um user especifico
    async listSchedules(tokenPayload: PAyloadTOkenDto){
        const list = await this.prisma.servicoAgendado.findMany({
            where:{
                user_id:tokenPayload.sub
            },
            select:{
            id:true,
            date:true,
            barbeiro:true,
            hour:true,
            servico:true,
            status:true,
            user: {
            select: {
              name: true,
              email: true,
            },
          },
            }
        })

        return list;
    }

    
    //Pega de todos users
    async listAgendas(paginationtsDto: PaginationsDto){
            const {limit = 10 ,offset = 0} = paginationtsDto ?? {}
          
          const alltask = await this.prisma.servicoAgendado.findMany({
            take: limit,
            skip: offset,
            orderBy:{
            created_at:"desc"
          }
        });
        return alltask;
    }



    async deleteService(id: string, tokenPayload: PAyloadTOkenDto){
        const service = await this.prisma.servicoAgendado.findUnique({
            where:{
                id: id,
                user_id: tokenPayload.sub
            }
        })

        if(!service){
            throw new HttpException("Serviço não encontrado", HttpStatus.NOT_FOUND)
        }

        if(service.user_id !== tokenPayload.sub){
            throw new HttpException("Acesso negado", HttpStatus.FORBIDDEN)
        }

        await this.prisma.servicoAgendado.delete({
            where:{
                id: service.id
            }
        })

        return {message :" serviço deletado com sucesso"};
    }


    async statusAtuali(
  id: string,
  status: string,
  tokenPayload: PAyloadTOkenDto,
) {
  // Busca o agendamento
  const agendamento = await this.prisma.servicoAgendado.findFirst({
    where: {
      id: id,
      user_id: tokenPayload.sub,
    },
  });

  // Verifica se existe
  if (!agendamento) {
    throw new HttpException(
      "Agendamento não encontrado",
      HttpStatus.NOT_FOUND,
    );
  }

  // Atualiza o status
  const statusAtu = await this.prisma.servicoAgendado.update({
    where: {
      id: id,
    },
    data: {
      status: status,
    },
  });

  return statusAtu;
}



}
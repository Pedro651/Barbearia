
import {
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";

import { CreateScheduleDto } from "./dto/schedule.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { PaginationsDto } from "./dto/paginationsDto.js";
import { MailService } from "../mail/mail.service.js";

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // CRIAR AGENDAMENTO
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
        "Usuário não existe",
        HttpStatus.NOT_FOUND,
      );
    }

    // 1. Salvar agendamento no banco
    const agendamento = await this.prisma.servicoAgendado.create({
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

    // 2. Adicionar e-mail na fila BullMQ
    try {
      await this.mailService.enviarAgendamento({
        email: user.email,
        nome: user.name,
        servico: agendamento.servico.name,
        barbeiro: agendamento.barbeiro.name,
        data: agendamento.date.toLocaleDateString("pt-BR", {
          timeZone: "America/Recife",
        }),
        horario: agendamento.hour,
      });

      console.log("Confirmação de agendamento adicionada à fila!");

    } catch (error) {
      console.error(
        "Erro ao adicionar e-mail de agendamento:",
        error,
      );
    }

    return agendamento;
  }

  // LISTAR AGENDAMENTOS DO CLIENTE
  async listSchedules(tokenPayload: PAyloadTOkenDto) {
    const list = await this.prisma.servicoAgendado.findMany({
      where: {
        user_id: tokenPayload.sub,
      },
      select: {
        id: true,
        date: true,
        barbeiro: true,
        hour: true,
        servico: true,
        status: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return list;
  }

  // LISTAR TODOS OS AGENDAMENTOS
  async listAgendas(paginationtsDto: PaginationsDto) {
    const {
      limit = 10,
      offset = 0,
    } = paginationtsDto ?? {};

    const alltask = await this.prisma.servicoAgendado.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        created_at: "desc",
      },
    });

    return alltask;
  }

  // DELETAR AGENDAMENTO
  async deleteService(
    id: string,
    tokenPayload: PAyloadTOkenDto,
  ) {
    const service = await this.prisma.servicoAgendado.findUnique({
      where: {
        id: id,
        user_id: tokenPayload.sub,
      },
    });

    if (!service) {
      throw new HttpException(
        "Serviço não encontrado",
        HttpStatus.NOT_FOUND,
      );
    }

    if (service.user_id !== tokenPayload.sub) {
      throw new HttpException(
        "Acesso negado",
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.servicoAgendado.delete({
      where: {
        id: service.id,
      },
    });

    return {
      message: "Serviço deletado com sucesso",
    };
  }

  // ATUALIZAR STATUS
  async statusAtuali(
    id: string,
    status: string,
    tokenPayload: PAyloadTOkenDto,
  ) {
    const agendamento = await this.prisma.servicoAgendado.findFirst({
      where: {
        id: id,
        user_id: tokenPayload.sub,
      },
    });

    if (!agendamento) {
      throw new HttpException(
        "Agendamento não encontrado",
        HttpStatus.NOT_FOUND,
      );
    }

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

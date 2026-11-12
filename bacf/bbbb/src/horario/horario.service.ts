import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { HorarioDto } from "./dto/horario.dto.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { ListhourDto } from "./dto/listhour.dto.js";


@Injectable()
export class HorarioService{
    constructor(private prisma : PrismaService){}

  async createHorario(Horariodto: HorarioDto, tokenPayload: PAyloadTOkenDto) {

     if (tokenPayload.role !== "ADMIN") {
      throw new HttpException(
      "Acesso negado",
        HttpStatus.FORBIDDEN,
      );
    }


  return this.prisma.horario.create({
    data: {
      user: {
      connect: {
        id: tokenPayload.sub,
      },
    },
      date: new Date(Horariodto.date),
      hour: Horariodto.hour,
    },
  });
}
  


async editHorario(
  id: string,
  horarioDto: HorarioDto,
  tokenPayload: PAyloadTOkenDto
) {
  if (tokenPayload.role !== "ADMIN") {
    throw new HttpException("Acesso negado", HttpStatus.FORBIDDEN);
  }

  const horario = await this.prisma.horario.findFirst({
    where: {
      id: id,
      user_id: tokenPayload.sub,
    },
  });

  if (!horario) {
    throw new HttpException(
      "Horário não encontrado",
      HttpStatus.NOT_FOUND
    );
  }

  return this.prisma.horario.update({
    where: {
      id: horario.id,
    },
    data: {
      date: new Date(horarioDto.date),
      hour: horarioDto.hour,
    },
  });
}



async deleteHorario(tokenPayload: PAyloadTOkenDto, id: string) {

  if (tokenPayload.role !== "ADMIN") {
    throw new HttpException("Acesso negado", HttpStatus.FORBIDDEN);
  }

  const horario = await this.prisma.horario.findFirst({
    where: {
      id: id,
      user_id: tokenPayload.sub,
    },
  });

  if (!horario) {
    throw new HttpException(
      "Horário não encontrado",
      HttpStatus.NOT_FOUND
    );
  }

  await this.prisma.horario.delete({
    where: {
      id: horario.id,
    },
  });

  return { message: "Horário deletado com sucesso" };
}

async listHourAgendas(paginationtsDto: ListhourDto) {
  const { limit = 10, offset = 0 } = paginationtsDto ?? {};

  return this.prisma.horario.findMany({
    take: Number(limit),
    skip: Number(offset),
    orderBy: [
      { date: "asc" },
      { hour: "asc" },
    ],
  });
}
}

import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ServicoDto } from "./dto/servi.dto.js";
import { ListserverDto } from "./dto/listserver.dto.js";

@Injectable()
export class ServicoService {
  constructor(private prisma: PrismaService) {}

  // CRIAR SERVIÇO
  async createServico(
    tokenPayload: PAyloadTOkenDto,
    servicoDto: ServicoDto
  ) {
    if (tokenPayload.role !== "ADMIN") {
      throw new HttpException(
        "Acesso negado",
        HttpStatus.FORBIDDEN
      );
    }

    const createServico = await this.prisma.servico.create({
      data: {
        user_id: tokenPayload.sub,
        name: servicoDto.name,
        price: servicoDto.price,
      },
    });

    return createServico;
  }

  // EDITAR SERVIÇO
  async editServico(
    tokenPayload: PAyloadTOkenDto,
    id: string,
    servicoDto: ServicoDto
  ) {
    if (tokenPayload.role !== "ADMIN") {
      throw new HttpException(
        "Acesso negado",
        HttpStatus.FORBIDDEN
      );
    }

    const servico = await this.prisma.servico.findFirst({
      where: {
        id,
        user_id: tokenPayload.sub,
      },
    });

    if (!servico) {
      throw new HttpException(
        "Serviço não encontrado",
        HttpStatus.NOT_FOUND
      );
    }

    const editServico = await this.prisma.servico.update({
      where: {
        id: servico.id,
      },
      data: {
        name: servicoDto.name,
        price: servicoDto.price,
      },
    });

    return editServico;
  }

  // DELETAR SERVIÇO
  async deleteServico(
    tokenPayload: PAyloadTOkenDto,
    id: string
  ) {
    if (tokenPayload.role !== "ADMIN") {
      throw new HttpException(
        "Acesso negado",
        HttpStatus.FORBIDDEN
      );
    }

    const servico = await this.prisma.servico.findFirst({
      where: {
        id,
        user_id: tokenPayload.sub,
      },
    });

    if (!servico) {
      throw new HttpException(
        "Serviço não encontrado",
        HttpStatus.NOT_FOUND
      );
    }

    await this.prisma.servico.delete({
      where: {
        id: servico.id,
      },
    });

    return {
      message: "Serviço deletado com sucesso",
    };
  }

  // LISTAR SERVIÇOS
  async listServeAgendas(paginationtsDto: ListserverDto) {
    const limit = Number(paginationtsDto?.limit ?? 10);
    const offset = Number(paginationtsDto?.offset ?? 0);

    return this.prisma.servico.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        name: "asc",
      },
    });
  }
}

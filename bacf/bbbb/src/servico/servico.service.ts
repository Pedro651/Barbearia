import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ServicoDto } from "./dto/servi.dto.js";
import { ListserverDto } from "./dto/listserver.dto.js";




@Injectable()
export class ServicoService{

    constructor(private prisma : PrismaService){}



    async createServico(tokenPayload: PAyloadTOkenDto, servicoDto: ServicoDto){
        
           if (tokenPayload.role !== "ADMIN") {
                throw new HttpException(
                "Acesso negado",
                HttpStatus.FORBIDDEN,
                );
            }

        const createCorte = await this.prisma.servico.create({
            data:{
                user_id:tokenPayload.sub,
                name: servicoDto.name,
            }
        })

        return createCorte;
    }


    async editServico(
        tokenPayload: PAyloadTOkenDto,
        id: string,
        servicoDto: ServicoDto,
        ) {

            const barber = await this.prisma.servico.findUnique({
                where:{
                    id:id,
                    user_id:tokenPayload.sub
                }
            })

             if(!barber){
                    throw new HttpException("Barbeiro não encontrado", HttpStatus.NOT_FOUND)
                }
        
            if(barber.user_id !== tokenPayload.sub){
                throw new HttpException("Acesso negado", HttpStatus.FORBIDDEN)
            }


        const editCorte = await this.prisma.servico.update({
            where: {
            id: id,
            user_id: tokenPayload.sub,
            },
            data: {
            name: servicoDto.name,
            },
        });

        return editCorte;
    }

    async deleteServico(tokenPayload: PAyloadTOkenDto,id: string){
                const servico = await this.prisma.servico.findUnique({
                    where:{
                        id: id,
                        user_id: tokenPayload.sub
                    }
                })
        
                if(!servico){
                    throw new HttpException("servico não encontrado", HttpStatus.NOT_FOUND)
                }
        
                if(servico.user_id !== tokenPayload.sub){
                    throw new HttpException("Acesso negado", HttpStatus.FORBIDDEN)
                }

        await this.prisma.servico.delete({
            where:{
                id:servico.id,

            }
        })

        return {message :" serviço deletado com sucesso"};
    }

        //Pega de todos users
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
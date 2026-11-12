import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { CortesDto } from "./dto/cortes.Dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ListBarberDto } from "./dto/listbarbe.dto.js";




@Injectable()
export class BarbeiroService{

    constructor(private prisma : PrismaService){}



    async createBarber(tokenPayload: PAyloadTOkenDto, cortesDto: CortesDto){
        
           if (tokenPayload.role !== "ADMIN") {
                throw new HttpException(
                "Acesso negado",
                HttpStatus.FORBIDDEN,
                );
            }

        const createCorte = await this.prisma.barbeiro.create({
            data:{
                user_id:tokenPayload.sub,
                name: cortesDto.name,
            }
        })

        return createCorte;
    }


    async editBarber(
        tokenPayload: PAyloadTOkenDto,
        id: string,
        cortesDto: CortesDto,
        ) {

            const barber = await this.prisma.barbeiro.findUnique({
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


        const editCorte = await this.prisma.barbeiro.update({
            where: {
            id: id,
            user_id: tokenPayload.sub,
            },
            data: {
            name: cortesDto.name,
            },
        });

        return editCorte;
    }

    async deleteBarber(tokenPayload: PAyloadTOkenDto,id: string){
                const barber = await this.prisma.barbeiro.findUnique({
                    where:{
                        id: id,
                        user_id: tokenPayload.sub
                    }
                })
        
                if(!barber){
                    throw new HttpException("Barbeiro não encontrado", HttpStatus.NOT_FOUND)
                }
        
                if(barber.user_id !== tokenPayload.sub){
                    throw new HttpException("Acesso negado", HttpStatus.FORBIDDEN)
                }

        await this.prisma.barbeiro.delete({
            where:{
                id:barber.id,

            }
        })

        return {message :" serviço deletado com sucesso"};
    }


 async listBarberAgendas(paginationtsDto: ListBarberDto) {
  const limit = Number(paginationtsDto?.limit ?? 10);
  const offset = Number(paginationtsDto?.offset ?? 0);

  const alltask = await this.prisma.barbeiro.findMany({
    take: limit,
    skip: offset,
    orderBy: {
      name: "asc",
    },
  });

  return alltask;
}

    


}
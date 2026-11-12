import { ForbiddenException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { SignInDto } from "./dto/sigin.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { HashingServiceProtocol } from "./hash/hashing.service.js";
import jwtConfig from "./config/jwt.config.js";
import { type ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { StringValue } from "ms";
import { TokenPayload } from "../types/next.js";
import { PAyloadTOkenDto } from "./dto/payload-token.dto.js";
import { RoleDTO } from "./dto/role.dto.js";


@Injectable()
export class AuthService{

    constructor(
        private prisma: PrismaService,
        private readonly hashinService: HashingServiceProtocol,

        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly jwtService: JwtService
    ){}
   
    
    async authenticate(singInDto: SignInDto){
        const user = await this.prisma.user.findFirst({
            where:{
                email: singInDto.email,
                active:true
            }
        })

        if(!user){
            throw new HttpException("Falha ao autenticar o usuário", HttpStatus.UNAUTHORIZED)
        }

        const passwordIsValid = await this.hashinService.compare(singInDto.password, user.password)

        if(!passwordIsValid){
            throw new HttpException("Senha/usuário incorreto", HttpStatus.UNAUTHORIZED)
        
        }

        const token = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                role: user.role,
            },
            {
                secret: this.jwtConfiguration.secret,
                expiresIn: this.jwtConfiguration.jwtTtl as StringValue,
                audience: this.jwtConfiguration.audience,
                issuer: this.jwtConfiguration.issuer
            }
        )

        return{
            id: user.id,
            name: user.name,
            email: user.email,
            token:token,
            role: user.role,
        }
    }

    async getUser(tokenPayload:PAyloadTOkenDto){

        const getUse = await this.prisma.user.findUnique({
            where:{
                id:tokenPayload.sub,
            }
        })

        return getUse;
    }

   async getContas() {
   return this.prisma.user.findMany({     
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },

  });
}


    async rolee(tokenPayload:PAyloadTOkenDto,roleDTO:RoleDTO){

        if (tokenPayload.role !== 'ADMIN') {
        throw new ForbiddenException(
            'Somente administradores podem excluir'
        );
        }

        const rolee = await this.prisma.user.update({
            where:{
                id: tokenPayload.sub,
            },
            data:{
                role: roleDTO.role,
            }
        })

        return rolee;
    }


    async deleteUser(id:string,tokenPayload:PAyloadTOkenDto){
        if (tokenPayload.role !== 'ADMIN') {
        throw new ForbiddenException(
            'Somente administradores podem excluir'
        );
    }
        const delet = await this.prisma.user.delete({
             where: {
             id: id,
            },
        })

        return delet;
    }
}
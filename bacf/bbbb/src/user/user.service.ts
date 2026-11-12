import { ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { HashingServiceProtocol } from "../auth/hash/hashing.service.js";
import { LoginDto } from "./dto/login-user.dto.js";
import bcrypt, { compare } from "bcryptjs";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import * as path from 'node:path'
import * as fs from 'node:fs/promises'

@Injectable()
export class UserService{

    constructor(
        private prisma:PrismaService,
        private readonly hashingService: HashingServiceProtocol
    ){}

   
async create(createUserDto: CreateUserDto) {
  try {
    const passwordHash = await this.hashingService.hash(
      createUserDto.password,
    );

    const createUser = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    return createUser;
  } catch (err) {
    console.error("Erro real ao cadastrar usuário:", err);

    // E-mail já cadastrado
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      throw new HttpException(
        "Este e-mail já está cadastrado",
        HttpStatus.CONFLICT,
      );
    }

    // Outros erros: não esconda a causa original nos logs
    throw new HttpException(
      "Não foi possível cadastrar o usuário",
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

    



    
    //Vou trocar ainda
    async update(id:string, updateUser:UpdateUserDto, tokenPayLoad:PAyloadTOkenDto){
      
      try{
        const user = await this.prisma.user.findFirst({
        where:{
          id:id,
        },
      })

      if(!user){
        throw new HttpException('Usuario não existe', HttpStatus.BAD_REQUEST)
      }

      if (user.id !== String(tokenPayLoad.sub)) {
      throw new ForbiddenException('Acesso não permitido');
      }

      const dataUser: {name?: string, password?:string, email?:string} = {
        name: updateUser.name ? updateUser.name : user.name,
        email: updateUser.email ? updateUser.email : user.email,
      }

      if(updateUser?.password){
        const password = await this.hashingService.hash(updateUser?.password)
        dataUser['password'] = password
      }

        const upadateUser = await this.prisma.user.update({
          where:{
            id: user.id
          },
          data:{
            name: dataUser.name,
             email: dataUser.email,
            password: dataUser?.password ? dataUser?.password : user.password
          },select:{
            id:true,
            name:true,
            email:true,
            avatar:true,
          }
        })

        return upadateUser;
        
      }catch(err){
        console.log(err)
        throw new HttpException("Falha ao atualizar o usuario", HttpStatus.BAD_REQUEST)
      }
    }
    



    //Troca a senha pelo gmail ou no site
    //Autenticação de 2FA

    async uploadAvatarImage(tokenPayLoad:PAyloadTOkenDto, file:Express.Multer.File){
      try{
         const mimeType = file.mimetype;
         const fileExtension = path.extname(file.originalname).toLowerCase().substring(1)
      
      
        const fileName = `${tokenPayLoad.sub}.${fileExtension}`
        const fileLocale = path.resolve(process.cwd(),'files',fileName)
          
        await fs.writeFile(fileLocale, file.buffer)

        const user  = await this.prisma.user.findFirst({
          where:{
            id:tokenPayLoad.sub
          }
        })

        if(!user){
           throw new HttpException("Falha ao atualizar o avatar do usuário", HttpStatus.BAD_REQUEST)
        }

        //salva no banco o caminho da foto
        const updateUser = await this.prisma.user.update({
          where:{
            id:user.id
          },
          data:{
            avatar:fileName
          },
          select:{
            name:true,
            id:true,
            email:true,
            avatar:true,
          }
        })

        return updateUser;

      }catch(err){
        throw new HttpException("Falha ao atualizar o avatar do usuário", HttpStatus.BAD_REQUEST)
      }
    }

}
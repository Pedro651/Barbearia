import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import path from "path";
import { randomUUID } from "crypto";
import * as fs from 'fs';
import { UpdateProductDto } from "./dto/update-product.dto.js";
import { PaginationsProductDto } from "./dto/paginationProdDto.js";

@Injectable()
export class ProductService {
     
    constructor(private prisma:PrismaService){}


    async createProduct(productDto:CreateProductDto, tokenPayload: PAyloadTOkenDto, file:Express.Multer.File){

        if (tokenPayload.role !== 'ADMIN') {
        throw new ForbiddenException(
            'Somente administradores podem excluir'
        );
        }
        if (!file) {
        throw new BadRequestException('Imagem não enviada');
        }

        const fileExtension = path.extname(file.originalname).toLowerCase();
              
              
        
        const fileName = `${randomUUID()}${fileExtension}`; 
        const fileLocale = path.resolve(
        process.cwd(),
        'files',
        fileName
        );

        const user = await this.prisma.user.findUnique({
            where:{
                id: tokenPayload.sub
            }
        })

        if(!user){
            throw new Error("Usuário não encontrado")
        }
        await fs.promises.writeFile(fileLocale, file.buffer);


        const createdProduct = await this.prisma.product.create({
            data:{
                user_id:user.id,
                name: productDto.name,
                avatar: fileName,
                description: productDto.description,
                price: productDto.price,

            }
        })

        return createdProduct;
    }


    
async listProducts(paginationtsDto: PaginationsProductDto) {

    const limit = Number(paginationtsDto?.limit ?? 10);
    const offset = Number(paginationtsDto?.offset ?? 0);

    // Verifica se os valores são números válidos
    if (
        !Number.isInteger(limit) ||
        !Number.isInteger(offset) ||
        limit < 1 ||
        offset < 0
    ) {
        throw new BadRequestException(
            "Paginação inválida"
        );
    }

    const allProducts = await this.prisma.product.findMany({
        take: limit,
        skip: offset,
        orderBy: {
            created_at: "desc"
        }
    });

    return allProducts;
}







    async deleteProduct(id:string, tokenPayload: PAyloadTOkenDto){
    if (tokenPayload.role !== 'ADMIN') {
        throw new ForbiddenException(
            'Somente administradores podem excluir'
        );
    }

    const product = await this.prisma.product.findUnique({
        where:{
            id:id,
            
        }
    })
    
    if(!product){
    throw new HttpException("Produto não encontrado", HttpStatus.NOT_FOUND)
    }
    
    if(product.user_id !== tokenPayload.sub){
    throw new HttpException("Acesso negado", HttpStatus.FORBIDDEN)
    }

    await this.prisma.product.delete({
        where:{
            id: product.id
        }
    })
    return {message :" produto deletado com sucesso"};
    }

    async updateProduct(
    id: string,
    productDto: UpdateProductDto,
    tokenPayload: PAyloadTOkenDto,
    file?: Express.Multer.File
) {
    if (tokenPayload.role !== 'ADMIN') {
    throw new ForbiddenException(
        'Somente administradores podem atualizar produtos'
    );
}
    const product = await this.prisma.product.findFirst({
        where: {
            id,
            user_id: tokenPayload.sub
        }
    });

    if (!product) {
        throw new NotFoundException('Produto não encontrado');
    }

    let fileName = product.avatar;

    if (file) {
        const fileExtension = path.extname(file.originalname).toLowerCase();

        fileName = `${randomUUID()}${fileExtension}`;

        const fileLocale = path.resolve(
            process.cwd(),
            'files',
            fileName
        );

        await fs.promises.mkdir(path.dirname(fileLocale), {
            recursive: true
        });

        await fs.promises.writeFile(fileLocale, file.buffer);
    }

    return this.prisma.product.update({
        where: {
            id
        },
        data: {
            name: productDto.name,
            description: productDto.description,
            price: productDto.price,
            avatar: fileName
        }
    });
}




}


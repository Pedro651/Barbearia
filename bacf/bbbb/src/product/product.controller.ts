import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service.js";
import { AuthTokenGard } from "../auth/guard/auth-token.guard.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
import { TokenPayloadParam } from "../auth/param/token-payload.param.js";
import { PAyloadTOkenDto } from "../auth/dto/payload-token.dto.js";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateProductDto } from "./dto/update-product.dto.js";
import { PaginationsProductDto } from "./dto/paginationProdDto.js";


@Controller('products')
export class ProductController{
    constructor(private readonly productService:ProductService){}

    
    @UseGuards(AuthTokenGard)
    @Post('create')
    @UseInterceptors(FileInterceptor('file'))
    createProduct(
    @Body() productDto: CreateProductDto,
    @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    @UploadedFile(
        new ParseFilePipeBuilder()
        .addFileTypeValidator({
            fileType: /jpeg|jpg|png/,
        })
        .addMaxSizeValidator({
            maxSize: 10 * 1024 * 1024, // 10 MB
        })
        .build({
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    ) {
    return this.productService.createProduct(productDto, tokenPayload, file);
    }

    @UseGuards(AuthTokenGard)
    @Get('varios')
    listAgendaTotal(
        @Query() paginationtsDto: PaginationsProductDto, ){
            return this.productService.listProducts(paginationtsDto)
    }



    @UseGuards(AuthTokenGard)
    @Delete(':id')
    deleteProduct(
    @Param('id') id:string,
    @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
    ){
        return this.productService.deleteProduct(id,tokenPayload)

    }

    @UseGuards(AuthTokenGard)
    @Patch(':id')
    @UseInterceptors(FileInterceptor('file'))
    updateProduct(
        @Param('id') id: string,
        @Body() productDto: UpdateProductDto,
        @TokenPayloadParam() tokenPayload: PAyloadTOkenDto,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.productService.updateProduct(
            id,
            productDto,
            tokenPayload,
            file
        );
    }



}
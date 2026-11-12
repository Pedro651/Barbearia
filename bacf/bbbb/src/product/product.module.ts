import { Module } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProductController } from './product.controller.js';


@Module({
    imports:[PrismaModule],
    controllers:[ProductController],
    providers:[ProductService],
})

export class ProductModule {}
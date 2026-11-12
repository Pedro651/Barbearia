import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import {ConfigModule} from '@nestjs/config'


@Module({
  imports:[PrismaModule, ConfigModule.forRoot({
      isGlobal: true,
    }),],
  controllers: [UserController],
  providers: [UserService]
})
export class UsersModule {}

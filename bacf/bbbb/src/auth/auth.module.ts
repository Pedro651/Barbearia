import { Global, Module } from "@nestjs/common";
import { HashingServiceProtocol } from "./hash/hashing.service.js";
import { BcryptService } from "./hash/bcrypt.service.js";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { ConfigModule } from "@nestjs/config";
import jwtConfig from "./config/jwt.config.js";
import {JwtModule} from "@nestjs/jwt"

@Global()
@Module({
  imports:[
    PrismaModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider())
  ],
  providers: [
    {
        provide:HashingServiceProtocol,
        useClass:BcryptService
    },
    AuthService
  ],
  exports:[
    HashingServiceProtocol,
    JwtModule,
    ConfigModule
  ],
  controllers: [AuthController],
  
})
export class AuthModule {}

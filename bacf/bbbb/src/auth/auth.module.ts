import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { BullModule } from "@nestjs/bullmq";

import { HashingServiceProtocol } from "./hash/hashing.service.js";
import { BcryptService } from "./hash/bcrypt.service.js";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import jwtConfig from "./config/jwt.config.js";
import { TwoFactorService } from "./two-factor.service.js";
import { MailProcessor } from "../mail/mail.processor.js";

@Global()
@Module({
  imports: [
    PrismaModule,

    ConfigModule.forFeature(jwtConfig),

    JwtModule.registerAsync(jwtConfig.asProvider()),

    BullModule.registerQueue({
      name: "mail",
    }),
  ],

  providers: [
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService,
    },
    AuthService,
    TwoFactorService,
    MailProcessor,
  ],

  exports: [
    HashingServiceProtocol,
    JwtModule,
    ConfigModule,
    TwoFactorService,
  ],

  controllers: [AuthController],
})
export class AuthModule {}
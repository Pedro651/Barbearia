
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import jwtConfig from "../config/jwt.config.js";
import { type ConfigType } from "@nestjs/config";
import { REQUEST_TOKEN_PAYLOAD_NAME } from "../common/auth.constants.js";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class AuthTokenGard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenHeader(request);

    if (!token) {
      throw new UnauthorizedException("Token não encontrado");
    }

    try {
      // Verifica se o token é válido
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration
      );

      // Busca o usuário atual no banco
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user || !user.active) {
        throw new UnauthorizedException("Acesso não autorizado");
      }

      // Atualiza a role com o valor atual do banco
      payload.role = user.role;

      // Disponibiliza os dados para o controller
      request[REQUEST_TOKEN_PAYLOAD_NAME] = payload;

      return true;

    } catch (err) {
      console.log(err);

      throw new UnauthorizedException("Acesso não autorizado");
    }
  }

  extractTokenHeader(request: Request) {
    const authorization = request.headers?.authorization;

    if (!authorization || typeof authorization !== "string") {
      return undefined;
    }

    return authorization.split(" ")[1];
  }
}

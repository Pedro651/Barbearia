
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";

import { SignInDto } from "./dto/sigin.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { HashingServiceProtocol } from "./hash/hashing.service.js";
import jwtConfig from "./config/jwt.config.js";
import { type ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { StringValue } from "ms";
import { PAyloadTOkenDto } from "./dto/payload-token.dto.js";
import { RoleDTO } from "./dto/role.dto.js";
import { TwoFactorService } from "./two-factor.service.js";
import { Queue, QueueEvents } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import bcrypt from "bcryptjs";

export type LoginResult = {
  twoFactorRequired: true;
  emailSent: true;
  challengeId: string;
  message: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly hashinService: HashingServiceProtocol,
    private readonly twoFactor: TwoFactorService,
    private readonly jwt: JwtService,

    @InjectQueue("mail")
    private readonly mailQueue: Queue,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    private readonly jwtService: JwtService,
  ) {}

  async authenticate(singInDto: SignInDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: singInDto.email,
        active: true,
      },
    });

    if (!user) {
      throw new HttpException(
        "Falha ao autenticar o usuário",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordIsValid = await this.hashinService.compare(
      singInDto.password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new HttpException(
        "Senha/usuário incorreto",
        HttpStatus.UNAUTHORIZED,
      );
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
        issuer: this.jwtConfiguration.issuer,
      },
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
      role: user.role,
    };
  }

  async getUser(tokenPayload: PAyloadTOkenDto) {
    const getUse = await this.prisma.user.findUnique({
      where: {
        id: tokenPayload.sub,
      },
    });

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

  async rolee(tokenPayload: PAyloadTOkenDto, roleDTO: RoleDTO) {
    if (tokenPayload.role !== "ADMIN") {
      throw new ForbiddenException(
        "Somente administradores podem excluir",
      );
    }

    const rolee = await this.prisma.user.update({
      where: {
        id: tokenPayload.sub,
      },
      data: {
        role: roleDTO.role,
      },
    });

    return rolee;
  }

  async deleteUser(id: string, tokenPayload: PAyloadTOkenDto) {
    if (tokenPayload.role !== "ADMIN") {
      throw new ForbiddenException(
        "Somente administradores podem excluir",
      );
    }

    const delet = await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return delet;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.active) {
      return null;
    }

    const senhaOk = await bcrypt.compare(password, user.password);

    if (!senhaOk) {
      return null;
    }

    return user;
  }

  async login(
    email: string,
    password: string,
    captchaToken: string,
  ): Promise<LoginResult> {
    await this.validarCaptcha(captchaToken);
    // 1. Valida as credenciais
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    // 2. Cria o desafio
    const { challengeId, codigo } =
      await this.twoFactor.createChallenge(user.id);

    // 3. Cria os eventos da fila
    const queueEvents = new QueueEvents("mail", {
      connection: {
        host: process.env.REDIS_HOST ?? "127.0.0.1",
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    });

    try {
      await queueEvents.waitUntilReady();

      // 4. Adiciona o e-mail à fila
      const job = await this.mailQueue.add(
        "send-2fa",
        {
          to: user.email,
          code: codigo,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: 50,
        },
      );

      // 5. Aguarda o envio ser concluído
      await job.waitUntilFinished(queueEvents, 20000);

      // 6. Retorna somente depois da confirmação
      return {
        twoFactorRequired: true,
        emailSent: true,
        challengeId,
        message: "Código enviado para seu e-mail.",
      };
    } catch (error) {
      console.error("Erro ao enviar código 2FA:", error);

      // Remove o desafio se o envio falhar
      await this.twoFactor.removeChallenge(challengeId);

      throw new InternalServerErrorException(
        "Não foi possível enviar o código para seu e-mail. Tente novamente.",
      );
    } finally {
      await queueEvents.close();
    }
  }

  async verify2fa(challengeId: string, code: string) {
    const userId = await this.twoFactor.verify(
      challengeId,
      code,
    );

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException("Usuário não encontrado ou inativo");
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
        issuer: this.jwtConfiguration.issuer,
      },
    );

    return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    endereco: user.endereco,
    token,
  };
  }


  // ADICIONADO: valida o CAPTCHA diretamente com o Google.
  private async validarCaptcha(captchaToken: string): Promise<void> {
    const secret = process.env.RECAPTCHA_SECRET_KEY;

    if (!secret) {
      throw new InternalServerErrorException(
        "A chave secreta do CAPTCHA não foi configurada."
      );
    }

    if (!captchaToken) {
      throw new UnauthorizedException(
        "Confirme que você não é um robô."
      );
    }

    try {
      const resposta = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            secret,
            response: captchaToken,
          }),
        }
      );

      const resultado = await resposta.json();

      // O Google precisa confirmar que o CAPTCHA foi resolvido.
      if (!resposta.ok || resultado.success !== true) {
        console.error("Falha na validação do CAPTCHA:", resultado);

        throw new UnauthorizedException(
          "CAPTCHA inválido ou expirado. Tente novamente."
        );
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error("Erro ao consultar o Google reCAPTCHA:", error);

      throw new InternalServerErrorException(
        "Não foi possível validar o CAPTCHA."
      );
    }
    
  }

  

}

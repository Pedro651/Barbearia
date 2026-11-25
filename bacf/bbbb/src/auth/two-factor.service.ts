// src/auth/two-factor.service.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {Redis} from 'ioredis';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

const JANELA_MS = 120_000; // 2 minutos
const TTL_SEGUNDOS = 120;

@Injectable()
export class TwoFactorService {
  private readonly secret: string;

  constructor(
    @Inject('REDIS') private readonly redis: Redis,
    config: ConfigService,
  ) {
    this.secret = config.getOrThrow<string>('OTP_SECRET');
  }




  // Calcula o código de 6 dígitos (a lógica do seu createCodigo)
  private calcularCodigo(user_id: string, tempoJanela: number): string {

    //Junta o id do user com intervalo de tempo
    const chaveCombinada = `${user_id}-${tempoJanela}`;

     // Cria um HMAC usando SHA-256 e uma chave secreta.
    const hash = createHmac('sha256', this.secret).update(chaveCombinada).digest('hex');

    // Pega os primeiros 8 caracteres do hash e converte esses caracteres de hexadecimal para número inteiro.
    const codigoInteiro = parseInt(hash.substring(0, 8), 16);

    // Transforma o número em um código de 6 dígitos.
    const codigo = (codigoInteiro % 900000) + 100000;

    return codigo.toString();
  }



    // Gera o código e salva o desafio no Redis
    async createChallenge(user_id: string, timeStamp = Date.now()) {
    // Faz o código mudar a cada 2 minutos
    const tempoJanela = Math.floor(timeStamp / JANELA_MS);

    // Reaproveita o cálculo do HMAC (mesma fórmula usada no verify)
    const codigo = this.calcularCodigo(user_id, tempoJanela);

    // ID único deste desafio de login
    const challengeId = randomUUID();

    // Salva só o necessário para recalcular o código no verify
    await this.redis.set(
        `2fa:challenge:${challengeId}`,
        JSON.stringify({ userId: user_id, janela: tempoJanela }),
        'EX',
        TTL_SEGUNDOS,
    );

    // O código vai para o envio (email/SMS). Nunca devolva ele na resposta da API.
    return { challengeId, codigo };
    }




  async verify(challengeId: string, code: string): Promise<string> {
    //Cria o nome de uma chave que será usada para armazenar temporariamente os dados da autenticação 2FA no Redis
    const key = `2fa:challenge:${challengeId}`;
    //Cria uma chave no Redis para contar quantas vezes o usuário tentou acertar o código 2FA
    const attemptsKey = `2fa:attempts:${challengeId}`;
    //2fa: identifica o sistema 2FA.
    //attempts: identifica o contador de tentativas.
    //${challengeId}: identifica o desafio de autenticação.



    // Busca o desafio no Redis:
    // Se não existe, ele expirou (passou 120s), já foi usado (foi apagado)
    // ou o challengeId é falso. Em qualquer caso, barra aqui.
    const raw = await this.redis.get(key);
    if (!raw) throw new UnauthorizedException('Código expirado ou inválido');

    // Soma 1 ao contador de tentativas e devolve o valor novo.
    // Se a chave não existia, começa em 0 e vira 1.
    // Cada chamada ao verify conta como uma tentativa.
    const attempts = await this.redis.incr(attemptsKey);

    //Verifica se é a primeira tentativa e coloca um limite de expiração da chave
    if (attempts === 1) await this.redis.expire(attemptsKey, TTL_SEGUNDOS);

    //Passou de 5 tentativas ele bloqueia e pede pra fazer o login novamente
    if (attempts > 5) {
      await this.redis.del(key, attemptsKey);
      throw new UnauthorizedException('Muitas tentativas. Faça login novamente');
    }

    //Pega as informações armazenadas em formato JSON e separando em duas variáveis.
    const { userId, janela } = JSON.parse(raw);


    // Ela gera/prepara o código que o servidor espera receber.
    const esperado = Buffer.from(this.calcularCodigo(userId, janela));
    //Esse codigo pega o codigo digita pelo usuário
    const recebido = Buffer.from(String(code));

    //Verirfica se é igual o codigo digitado pelo usuário com q gerou
    if (
      esperado.length !== recebido.length ||
      !timingSafeEqual(esperado, recebido)
    ) {
      throw new UnauthorizedException('Código inválido');
    }

    //Ele apaga do Redis: A chave usada para validar o código 2FA.
    await this.redis.del(key, attemptsKey); 

    return userId;
  }

  async removeChallenge(challengeId: string) {
  await this.redis.del(
    `2fa:challenge:${challengeId}`,
    `2fa:attempts:${challengeId}`,
  );
}
}
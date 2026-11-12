
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  // Disponibiliza as imagens salvas na pasta files
  app.useStaticAssets(join(process.cwd(), 'files'), {
    prefix: '/files/',
  });

  await app.listen(3333);

  console.log('Backend rodando em http://localhost:3333');
}

bootstrap();

import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from './schedule/schedule.module.js';
import { ProductModule } from './product/product.module.js';
import { BarbeiroModule } from './barbeiro/barbeiro.module.js';
import { ServicoModule } from './servico/servico.module.js';
import { HorarioModule } from './horario/horario.module.js';
import { OrderModule } from './order/order.module.js';
import { PaymenteModule } from './payment/payment.module.js';
import { StatisticsModule } from './statistics/statistics.module.js';



export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductModule,
    ScheduleModule,
    BarbeiroModule,
    ServicoModule,
    PaymenteModule,
    HorarioModule,
    StatisticsModule,
    OrderModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'file'),
      serveRoot: "/files"
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

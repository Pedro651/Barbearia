// redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import {Redis} from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS',
      useFactory: () =>
        new Redis({
          host: process.env.REDIS_HOST ?? '127.0.0.1',
          port: Number(process.env.REDIS_PORT ?? 6379),
        }),
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}
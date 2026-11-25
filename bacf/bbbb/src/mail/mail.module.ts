
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { MailService } from './mail.service.js';
import { MailProcessor } from './mail.processor.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  providers: [
    MailService,
    MailProcessor,
  ],
  exports: [
    MailService,
  ],
})
export class MailModule {}

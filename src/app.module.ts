import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { ChatModule } from './chat/chat.module';
import { KST } from './utils';

const logFormat = winston.format.printf((message) => {
  const now = KST();
  return `${JSON.stringify({ ...message, time: now })}`;
});

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
      format: winston.format.combine(logFormat),
    }),
    ChatModule,
  ],
})
export class AppModule {}

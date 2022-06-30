import { Module } from '@nestjs/common';
import { MessageGateway } from './message.gateway';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston/dist/winston.utilities';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(MessageModule.name, {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
  ],
  controllers: [],
  providers: [MessageGateway],
})
export class MessageModule {}

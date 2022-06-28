import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { MessageGateway } from './message/message.gateway';

@Module({
  imports: [MessageModule],
  controllers: [],
  providers: [MessageGateway],
})
export class AppModule {}

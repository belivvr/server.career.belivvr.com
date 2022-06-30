import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@WebSocketGateway(5001, { transports: ['websocket'], namespace: 'chat' })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: LoggerService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('chat')
  async handleMessage(@MessageBody() data, @ConnectedSocket() client) {
    client.broadcast.emit('chat', '[ID ' + client.id + '] : ' + data);
  }

  async getConnectedUserCount(): Promise<number> {
    const allSockets = await this.server.allSockets();
    return allSockets.size;
  }

  initLogging() {
    setInterval(async () => {
      // console.log('[LOG] User count : ' + (await this.getConnectedUserCount()));
      this.logger.debug('User count : ' + (await this.getConnectedUserCount()));
    }, 10000);
  }

  afterInit(server: Server): void {
    // console.log('after Init');
    this.logger.debug('after Init');
    this.initLogging();
  }

  handleConnection(socket: Socket): void {
    // console.log('[LOG] Connected : ' + socket.id);
    this.logger.debug('Connected : ' + socket.id);
  }

  handleDisconnect(socket: Socket): void {
    // console.log('[LOG] Disconnected : ' + socket.id);
    this.logger.debug('Disconnected : ' + socket.id);
  }
}

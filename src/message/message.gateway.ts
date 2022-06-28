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

@WebSocketGateway(5001, { transports: ['websocket'], namespace: 'chat' })
export class MessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('chat')
  async handleMessage(@MessageBody() data, @ConnectedSocket() client) {
    client.broadcast.emit('chat', '[ID ' + client.id + '] : ' + data);
  }

  async getConnectedUserCount(): Promise<number> {
    const count = await this.server.allSockets();
    return count.size;
  }

  initLogging() {
    setInterval(async () => {
      console.log('[LOG] User count : ' + (await this.getConnectedUserCount()));
      // console.log(this.socketMap);
    }, 10000);
  }

  afterInit(server: Server): void {
    console.log('after Init');
    this.initLogging();
  }

  handleConnection(socket: Socket): void {
    console.log('[LOG] Connected : ' + socket.id);
  }

  handleDisconnect(socket: Socket): void {
    console.log('[LOG] Disconnected : ' + socket.id);
  }
}

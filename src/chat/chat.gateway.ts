import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Socket, Server } from 'socket.io';

type SocketMap = Map<string, { name: string; kick: () => Socket }>;

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private sockets: SocketMap = new Map();

  @SubscribeMessage('name')
  handleName(socket: Socket, { name }: any): void {
    this.sockets.set(socket.id, { name, kick: () => socket.disconnect() });
  }
}

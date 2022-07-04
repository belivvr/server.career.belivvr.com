import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import type { Socket, Server } from 'socket.io';

type SocketMap = Map<string, { name: string; kick: () => Socket }>;

type NamePayload = { name: string };
type ChatPayload = string;
type Position = { x: number; y: number; z: number };
type Rotation = { x: number; y: number; z: number };
type OccupantsPayload = { id: string; position: Position; rotation: Rotation };

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private sockets: SocketMap = new Map();

  @SubscribeMessage('name')
  handleName(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { name }: NamePayload,
  ): void {
    this.sockets.set(socket.id, { name, kick: () => socket.disconnect() });
  }

  @SubscribeMessage('chat')
  handleChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chat: ChatPayload,
  ): void {
    const sender = this.sockets.get(socket.id);

    socket.broadcast.emit('chat', {
      id: socket.id,
      name: sender.name,
      message: chat,
    });
  }

  @SubscribeMessage('occupants')
  handleOccupants(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: OccupantsPayload,
  ): void {
    socket.broadcast.emit('occupants', data);
  }
}

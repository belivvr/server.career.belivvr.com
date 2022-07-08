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
type OccupantsPayload = {
  id: string;
  name: string;
  position: Position;
  rotation: Rotation;
};

const occupants = {};

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private sockets: SocketMap = new Map();

  handleConnection(@ConnectedSocket() socket: Socket) {
    socket.emit('all occupants', occupants);

    socket.on('disconnect', () => {
      this.server.emit('leave', socket.id);

      delete occupants[socket.id];
    });
  }

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
    socket.broadcast.emit('chat', {
      id: socket.id,
      message: chat,
    });
  }

  @SubscribeMessage('occupants')
  handleOccupants(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: OccupantsPayload,
  ): void {
    occupants[socket.id] = {
      name: data.name,
      position: data.position,
      rotation: data.rotation,
    };
    socket.broadcast.emit('occupants', { ...data, id: socket.id });
  }
}

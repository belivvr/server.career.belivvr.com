import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import type { Socket, Server } from 'socket.io';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';

type SocketMap = Map<string, { name: string; kick: () => Socket }>;

type NamePayload = { name: string };
type ChatPayload = {
  name: string;
  message: string;
};
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
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @WebSocketServer()
  server: Server;

  private sockets: SocketMap = new Map();

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.info({
      behavior: 'connect',
      id: socket.id,
    });

    socket.emit('all occupants', occupants);

    socket.on('disconnect', () => {
      this.logger.info({
        behavior: 'disconnect',
        id: socket.id,
      });

      this.server.emit('leave', socket.id);

      delete occupants[socket.id];
    });
  }

  @SubscribeMessage('name')
  handleName(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { name }: NamePayload,
  ): void {
    this.sockets.set(socket.id, {
      name: name.substring(0, 20),
      kick: () => socket.disconnect(),
    });
  }

  @SubscribeMessage('chat')
  handleChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() { name, message }: ChatPayload,
  ): void {
    this.logger.info({
      behavior: 'chat',
      id: socket.id,
      name: name.substring(0, 20),
      message,
    });

    socket.broadcast.emit('chat', {
      id: socket.id,
      message,
    });
  }

  @SubscribeMessage('occupants')
  handleOccupants(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: OccupantsPayload,
  ): void {
    occupants[socket.id] = {
      name: data.name.substring(0, 20),
      position: data.position,
      rotation: data.rotation,
    };
    socket.broadcast.emit('occupants', { ...data, id: socket.id });
  }

  @SubscribeMessage('logging')
  handleLogging(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: object,
  ): void {
    this.logger.info({
      id: socket.id,
      ...body,
    });
  }
}

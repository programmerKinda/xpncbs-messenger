import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';

interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
  };
}

@WebSocketGateway({ cors: { origin: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private readonly connectedUsers = new Map<string, number>();
  private readonly userSockets = new Map<string, Set<Socket>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  handleConnection(socket: AuthenticatedSocket) {
    const token = socket.handshake.auth?.token;

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      socket.data.userId = payload.sub;
      const connections = this.connectedUsers.get(payload.sub) ?? 0;
      this.connectedUsers.set(payload.sub, connections + 1);
      const sockets = this.userSockets.get(payload.sub) ?? new Set<Socket>();
      sockets.add(socket);
      this.userSockets.set(payload.sub, sockets);
      if (connections === 0) {
        this.server.emit('presence:update', {
          userId: payload.sub,
          status: 'online',
        });
      }
    } catch {
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    const userId = socket.data.userId;
    if (!userId) return;

    const sockets = this.userSockets.get(userId);
    sockets?.delete(socket);
    if (sockets && sockets.size === 0) this.userSockets.delete(userId);

    const connections = (this.connectedUsers.get(userId) ?? 1) - 1;
    if (connections <= 0) {
      this.connectedUsers.delete(userId);
      this.server.emit('presence:update', { userId, status: 'offline' });
    } else {
      this.connectedUsers.set(userId, connections);
    }
  }

  @SubscribeMessage('presence:list')
  getPresence(@ConnectedSocket() socket: AuthenticatedSocket) {
    socket.emit('presence:list', Array.from(this.connectedUsers.keys()));
  }

  @SubscribeMessage('chat:join')
  async joinChat(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    if (!socket.data.userId) return;

    const canAccess = await this.chatService.canAccessChat(
      chatId,
      socket.data.userId,
    );
    if (canAccess) socket.join(`chat:${chatId}`);
  }

  @SubscribeMessage('typing:start')
  async startTyping(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    if (
      !socket.data.userId ||
      !(await this.chatService.canAccessChat(chatId, socket.data.userId))
    )
      return;
    socket.to(`chat:${chatId}`).emit('typing:update', {
      chatId,
      userId: socket.data.userId,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  async stopTyping(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    if (
      !socket.data.userId ||
      !(await this.chatService.canAccessChat(chatId, socket.data.userId))
    )
      return;
    socket.to(`chat:${chatId}`).emit('typing:update', {
      chatId,
      userId: socket.data.userId,
      isTyping: false,
    });
  }

  @SubscribeMessage('call:offer')
  relayCallOffer(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      targetUserId: string;
      callId: string;
      type: 'audio' | 'video';
      offer: Record<string, unknown>;
      callerName: string;
      callerAvatarUrl?: string;
    },
  ) {
    if (!socket.data.userId || data.targetUserId === socket.data.userId) return;
    this.emitToUser(data.targetUserId, 'call:incoming', {
      ...data,
      callerId: socket.data.userId,
    });
  }

  @SubscribeMessage('call:answer')
  relayCallAnswer(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      targetUserId: string;
      callId: string;
      answer: Record<string, unknown>;
    },
  ) {
    if (!socket.data.userId || data.targetUserId === socket.data.userId) return;
    this.emitToUser(data.targetUserId, 'call:answered', {
      ...data,
      userId: socket.data.userId,
    });
  }

  @SubscribeMessage('call:ice')
  relayIceCandidate(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: {
      targetUserId: string;
      callId: string;
      candidate: Record<string, unknown>;
    },
  ) {
    if (!socket.data.userId || data.targetUserId === socket.data.userId) return;
    this.emitToUser(data.targetUserId, 'call:ice', {
      ...data,
      userId: socket.data.userId,
    });
  }

  @SubscribeMessage('call:end')
  relayCallEnd(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { targetUserId: string; callId: string },
  ) {
    if (!socket.data.userId || data.targetUserId === socket.data.userId) return;
    this.emitToUser(data.targetUserId, 'call:ended', {
      ...data,
      userId: socket.data.userId,
    });
  }

  private emitToUser(userId: string, event: string, payload: unknown) {
    this.userSockets
      .get(userId)
      ?.forEach((socket) => socket.emit(event, payload));
  }

  broadcastMessage(message: Message) {
    this.server.to(`chat:${message.chatId}`).emit('message:new', message);
  }
}

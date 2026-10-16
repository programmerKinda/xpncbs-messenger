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

interface CallSession {
  callId: string;
  initiatorId: string;
  participantIds: [string, string];
  type: 'audio' | 'video';
  status: 'ringing' | 'accepted';
  startedAt: Date;
  answeredAt?: Date;
}

@WebSocketGateway({ cors: { origin: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private readonly connectedUsers = new Map<string, number>();
  private readonly userSockets = new Map<string, Set<Socket>>();
  private readonly callSessions = new Map<string, CallSession>();

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

    this.callSessions.set(data.callId, {
      callId: data.callId,
      initiatorId: socket.data.userId,
      participantIds: [socket.data.userId, data.targetUserId],
      type: data.type,
      status: 'ringing',
      startedAt: new Date(),
    });

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

    const call = this.callSessions.get(data.callId);
    if (
      call &&
      call.initiatorId !== socket.data.userId &&
      call.participantIds.includes(socket.data.userId)
    ) {
      call.status = 'accepted';
      call.answeredAt ??= new Date();
    }

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
  async relayCallEnd(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { targetUserId: string; callId: string },
  ) {
    const endedByUserId = socket.data.userId;
    if (!endedByUserId) return;

    const call = this.callSessions.get(data.callId);
    if (!call) {
      console.error('[CALL END] Call session not found', {
        callId: data.callId,
        socketUserId: endedByUserId,
      });
      return;
    }

    console.log('[CALL END]', {
      callId: call.callId,
      socketUserId: endedByUserId,
      initiatorId: call.initiatorId,
      participantIds: call.participantIds,
    });

    if (!call.participantIds.includes(endedByUserId)) return;

    const otherUserId = call.participantIds.find(
      (participantId) => participantId !== call.initiatorId,
    );
    if (!otherUserId) {
      throw new Error(
        `Call ${call.callId} does not have a second participant`,
      );
    }
    const remoteUserId = call.participantIds.find(
      (participantId) => participantId !== endedByUserId,
    );
    if (!remoteUserId) return;

    console.log('[CALL MESSAGE PARTICIPANTS]', {
      initiatorId: call.initiatorId,
      otherUserId,
      endedByUserId,
    });

    // Remove synchronously before awaiting persistence so duplicate end events cannot create another message.
    this.callSessions.delete(call.callId);

    const endedAt = new Date();
    const finalStatus = call.status === 'accepted' ? 'accepted' : 'missed';
    const durationSeconds = call.answeredAt
      ? Math.floor((endedAt.getTime() - call.answeredAt.getTime()) / 1000)
      : 0;

    this.emitToUser(remoteUserId, 'call:ended', {
      callId: call.callId,
      userId: endedByUserId,
      endedByUserId,
    });

    console.log('[CALL MESSAGE CREATE]', {
      callId: call.callId,
      authorId: call.initiatorId,
      otherUserId,
      status: finalStatus,
      durationSeconds,
    });

    try {
      await this.chatService.findOrCreateDirectChatForUsers(
        call.initiatorId,
        otherUserId,
      );
      const message = await this.chatService.upsertCallMessage(
        call.initiatorId,
        otherUserId,
        call.callId,
        call.type,
        finalStatus,
        durationSeconds,
      );

      this.emitToUser(call.initiatorId, 'message:new', message);
      this.emitToUser(otherUserId, 'message:new', message);
    } catch (error) {
      console.error('[CALL MESSAGE ERROR]', error);
    }
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

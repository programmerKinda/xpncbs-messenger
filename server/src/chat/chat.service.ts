import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, MoreThan, Not, Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { ChatMember, ChatMemberRole } from './entities/chat-member.entity';
import { Chat, ChatType } from './entities/chat.entity';
import { Message, MessageType } from './entities/message.entity';

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMember)
    private readonly memberRepository: Repository<ChatMember>,

    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByRouteKey(
    userId: string,
    chatKey: string,
  ): Promise<(Chat & { unreadCount: number; lastMessage: any }) | null> {
    const query = this.memberRepository
      .createQueryBuilder('member')
      .innerJoinAndSelect('member.chat', 'chat')
      .where('member.userId = :userId', { userId });

    if (chatKey.startsWith('@')) {
      query
        .innerJoin(
          ChatMember,
          'directMember',
          'directMember.chatId = chat.id AND directMember.userId != :userId',
          { userId },
        )
        .innerJoin('directMember.user', 'participant')
        .andWhere('chat.type = :chatType', { chatType: ChatType.DIRECT })
        .andWhere('participant.username = :username', {
          username: chatKey.slice(1),
        });
    } else {
      query.andWhere('chat.id = :chatId', { chatId: chatKey });
    }

    const member = await query.getOne();
    if (!member) return null;

    const [otherMember, lastMessage, unreadCount] = await Promise.all([
      member.chat.type === ChatType.DIRECT
        ? this.memberRepository.findOne({
            where: { chatId: member.chat.id, userId: Not(userId) },
            relations: { user: true },
          })
        : Promise.resolve(null),
      this.messageRepository.findOne({
        where: { chatId: member.chat.id },
        order: { createdAt: 'DESC', id: 'DESC' },
      }),
      this.messageRepository.count({
        where: {
          chatId: member.chat.id,
          senderId: Not(userId),
          ...(member.lastReadAt ? { createdAt: MoreThan(member.lastReadAt) } : {}),
        },
      }),
    ]);

    return {
      ...member.chat,
      unreadCount,
      ...(otherMember?.user
        ? {
            participantId: otherMember.userId,
            participant: {
              id: otherMember.user.id,
              phone: otherMember.user.phone,
              firstName: otherMember.user.firstName,
              lastName: otherMember.user.lastName,
              username: otherMember.user.username,
              about: otherMember.user.about,
              avatarUrl: otherMember.user.avatarUrl,
            },
            title: `${otherMember.user.firstName} ${otherMember.user.lastName ?? ''}`.trim(),
            avatarUrl: otherMember.user.avatarUrl,
          }
        : {}),
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            senderId: lastMessage.senderId,
            type: lastMessage.type,
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
          }
        : null,
    };
  }

  async findForUser(
    userId: string,
    limit = 20,
    cursor?: string,
  ): Promise<PaginatedResult<Chat & { unreadCount: number; lastMessage: any }>> {
    const normalizedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100)

    const query = this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.chat', 'chat')
      .where('member.userId = :userId', { userId })
      .orderBy('chat.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('chat.createdAt', 'DESC')
      .addOrderBy('chat.id', 'DESC')
      .limit(normalizedLimit + 1)

    if (cursor) {
      const parsedCursor = this.parseChatCursor(cursor)
      if (parsedCursor) {
        query.andWhere(
          parsedCursor.lastMessageAt
            ? '(chat.lastMessageAt IS NULL OR chat.lastMessageAt < :cursorLastMessageAt OR (chat.lastMessageAt = :cursorLastMessageAt AND (chat.createdAt < :cursorCreatedAt OR (chat.createdAt = :cursorCreatedAt AND chat.id < :cursorId))))'
            : 'chat.lastMessageAt IS NULL AND (chat.createdAt < :cursorCreatedAt OR (chat.createdAt = :cursorCreatedAt AND chat.id < :cursorId))',
          {
            cursorLastMessageAt: parsedCursor.lastMessageAt,
            cursorCreatedAt: parsedCursor.createdAt,
            cursorId: parsedCursor.id,
          },
        )
      }
    }

    const members = await query.getMany()
    const hasMore = members.length > normalizedLimit
    const pageMembers = hasMore ? members.slice(0, normalizedLimit) : members

    const chatIds = pageMembers.map((member) => member.chat.id)
    const lastMessages = chatIds.length
      ? await this.messageRepository
          .createQueryBuilder('message')
          .distinctOn(['message.chatId'])
          .where('message.chatId IN (:...chatIds)', { chatIds })
          .orderBy('message.chatId', 'ASC')
          .addOrderBy('message.createdAt', 'DESC')
          .addOrderBy('message.id', 'DESC')
          .getMany()
      : []
    const unreadRows = chatIds.length
      ? await this.messageRepository
          .createQueryBuilder('message')
          .innerJoin(
            ChatMember,
            'member',
            'member.chatId = message.chatId AND member.userId = :userId',
            { userId },
          )
          .select('message.chatId', 'chatId')
          .addSelect('COUNT(message.id)', 'unreadCount')
          .where('message.chatId IN (:...chatIds)', { chatIds })
          .andWhere('message.senderId != :userId', { userId })
          .andWhere('(member.lastReadAt IS NULL OR message.createdAt > member.lastReadAt)')
          .groupBy('message.chatId')
          .getRawMany<{ chatId: string; unreadCount: string }>()
      : []
    const directChatIds = pageMembers
      .filter((member) => member.chat.type === ChatType.DIRECT)
      .map((member) => member.chat.id)
    const otherMembers = directChatIds.length
      ? await this.memberRepository
          .createQueryBuilder('member')
          .innerJoinAndSelect('member.user', 'user')
          .where('member.chatId IN (:...directChatIds)', { directChatIds })
          .andWhere('member.userId != :userId', { userId })
          .getMany()
      : []

    const lastMessageByChat = new Map(lastMessages.map((message) => [message.chatId, message]))
    const unreadCountByChat = new Map(
      unreadRows.map((row) => [row.chatId, Number(row.unreadCount)]),
    )
    const participantByChat = new Map(otherMembers.map((member) => [member.chatId, member]))

    const items = pageMembers.map((member) => {
      const chat = member.chat
      const lastMessage = lastMessageByChat.get(chat.id)
      const otherMember = participantByChat.get(chat.id)

      return {
        ...chat,
        unreadCount: unreadCountByChat.get(chat.id) ?? 0,
        ...(otherMember?.user
          ? {
              participantId: otherMember.userId,
              participant: {
                id: otherMember.user.id,
                phone: otherMember.user.phone,
                firstName: otherMember.user.firstName,
                lastName: otherMember.user.lastName,
                username: otherMember.user.username,
                about: otherMember.user.about,
                avatarUrl: otherMember.user.avatarUrl,
              },
              title: `${otherMember.user.firstName} ${otherMember.user.lastName ?? ''}`.trim(),
              avatarUrl: otherMember.user.avatarUrl,
            }
          : {}),
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              senderId: lastMessage.senderId,
              type: lastMessage.type,
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
            }
          : null,
      }
    })

    const nextCursor =
      hasMore && pageMembers.length > 0
        ? JSON.stringify({
            lastMessageAt: pageMembers[pageMembers.length - 1].chat.lastMessageAt,
            createdAt: pageMembers[pageMembers.length - 1].chat.createdAt,
            id: pageMembers[pageMembers.length - 1].chat.id,
          })
        : null

    return {
      items,
      nextCursor,
      hasMore,
    }
  }

  async findMessagesForUser(
    chatId: string,
    userId: string,
    limit = 50,
    before?: string,
  ): Promise<PaginatedResult<Message>> {
    const membership = await this.memberRepository.findOne({
      where: { chatId, userId },
    })

    if (!membership) {
      throw new ForbiddenException('Нет доступа к этому чату')
    }

    const normalizedLimit = Math.min(Math.max(Number(limit) || 50, 1), 200)
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('message.id', 'DESC')
      .limit(normalizedLimit + 1)

    if (before) {
      const parsedCursor = this.parseMessageCursor(before)
      if (parsedCursor) {
        query.andWhere(
          '(message.createdAt < :beforeDate OR (message.createdAt = :beforeDate AND message.id < :beforeId))',
          { beforeDate: parsedCursor.createdAt, beforeId: parsedCursor.id },
        )
      }
    }

    const rows = await query.getMany()
    const hasMore = rows.length > normalizedLimit
    const pageRows = hasMore ? rows.slice(0, normalizedLimit) : rows

    return {
      items: [...pageRows].reverse(),
      nextCursor:
        hasMore && pageRows.length > 0
          ? JSON.stringify({
              createdAt: pageRows[pageRows.length - 1].createdAt,
              id: pageRows[pageRows.length - 1].id,
            })
          : null,
      hasMore,
    }
  }

  private parseChatCursor(
    cursor: string,
  ): { lastMessageAt: Date | null; createdAt: Date; id: string } | null {
    try {
      const value = JSON.parse(cursor) as {
        lastMessageAt?: string | null;
        createdAt?: string;
        id?: string;
      }
      const createdAt = new Date(value.createdAt ?? '')
      const lastMessageAt = value.lastMessageAt ? new Date(value.lastMessageAt) : null
      if (!value.id || Number.isNaN(createdAt.getTime())) return null
      if (value.lastMessageAt && Number.isNaN(lastMessageAt?.getTime())) return null
      return { lastMessageAt, createdAt, id: value.id }
    } catch {
      return null
    }
  }

  private parseMessageCursor(cursor: string): { createdAt: Date; id: string } | null {
    try {
      const value = JSON.parse(cursor) as { createdAt?: string; id?: string }
      const createdAt = new Date(value.createdAt ?? '')
      if (!value.id || Number.isNaN(createdAt.getTime())) return null
      return { createdAt, id: value.id }
    } catch {
      return null
    }
  }

  canAccessChat(chatId: string, userId: string): Promise<boolean> {
    return this.memberRepository.exists({ where: { chatId, userId } });
  }

  async markChatRead(chatId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { chatId, userId },
    });

    if (!member) {
      throw new ForbiddenException('Нет доступа к этому чату');
    }

    member.lastReadAt = new Date();
    await this.memberRepository.save(member);
  }

  async findOrCreateDirectChat(
    userId: string,
    username: string,
  ): Promise<Chat> {
    const targetUser = await this.userRepository.findOne({
      where: { username },
    });

    if (!targetUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.findOrCreateDirectChatForUsers(userId, targetUser.id);
  }

  async findOrCreateDirectChatForUsers(
    userId: string,
    targetUserId: string,
  ): Promise<Chat> {
    if (targetUserId === userId) {
      throw new BadRequestException('Нельзя открыть чат с самим собой');
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    const existingChat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin(
        ChatMember,
        'currentMember',
        'currentMember.chatId = chat.id AND currentMember.userId = :userId',
        { userId },
      )
      .innerJoin(
        ChatMember,
        'targetMember',
        'targetMember.chatId = chat.id AND targetMember.userId = :targetUserId',
        { targetUserId },
      )
      .where('chat.type = :chatType', { chatType: ChatType.DIRECT })
      .getOne();

    if (existingChat) return existingChat;

    return this.chatRepository.manager.transaction(async (manager) => {
      const chat = await manager.getRepository(Chat).save(
        manager.getRepository(Chat).create({
          type: ChatType.DIRECT,
          title: `${targetUser.firstName} ${targetUser.lastName ?? ''}`.trim(),
          createdById: userId,
        }),
      );

      await manager.getRepository(ChatMember).save([
        manager.getRepository(ChatMember).create({
          chatId: chat.id,
          userId,
          role: ChatMemberRole.MEMBER,
        }),
        manager.getRepository(ChatMember).create({
          chatId: chat.id,
          userId: targetUserId,
          role: ChatMemberRole.MEMBER,
        }),
      ]);

      return {
        ...chat,
        participantId: targetUserId,
        participant: {
          id: targetUser.id,
          phone: targetUser.phone,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          username: targetUser.username,
          about: targetUser.about,
          avatarUrl: targetUser.avatarUrl,
        },
        title: `${targetUser.firstName} ${targetUser.lastName ?? ''}`.trim(),
        avatarUrl: targetUser.avatarUrl,
      };
    });
  }

  async upsertCallMessage(
    initiatorUserId: string,
    targetUserId: string,
    callId: string,
    type: 'audio' | 'video',
    status: 'accepted' | 'missed',
    durationSeconds = 0,
  ): Promise<Message> {
    const chat = await this.findOrCreateDirectChatForUsers(
      initiatorUserId,
      targetUserId,
    );

    const callMessages = await this.messageRepository.find({
      where: { chatId: chat.id, type: MessageType.CALL },
    });
    const existingMessage = callMessages.find((message) => {
      if (typeof message.content === 'string') return false;
      return message.content.callId === callId;
    });

    if (existingMessage && typeof existingMessage.content !== 'string') {
      const nextContent = {
        ...existingMessage.content,
        status,
        durationSeconds,
      };

      existingMessage.content = nextContent;
      return this.messageRepository.save(existingMessage);
    }

    return this.createMessageForUser(chat.id, initiatorUserId, MessageType.CALL, {
      callId,
      direction: 'outgoing',
      type,
      status,
      durationSeconds,
    });
  }

  async updateCallMessageStatus(
    chatId: string,
    callId: string,
    status: 'accepted' | 'missed',
    durationSeconds = 0,
  ): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: { chatId, type: MessageType.CALL },
    });

    const matchingMessages = messages.filter((message) => {
      if (typeof message.content === 'string') return false;
      return message.content.callId === callId;
    });

    const updatedMessages: Message[] = [];

    for (const message of matchingMessages) {
      if (typeof message.content === 'string') continue;

      const currentStatus =
        typeof message.content.status === 'string'
          ? message.content.status
          : null;
      const nextStatus = currentStatus === 'accepted' ? 'accepted' : status;

      const nextContent = {
        ...message.content,
        status: nextStatus,
        durationSeconds,
      };

      message.content = nextContent;
      updatedMessages.push(await this.messageRepository.save(message));
    }

    return updatedMessages;
  }

  async createMessageForUser(
    chatId: string,
    userId: string,
    type: Message['type'],
    content: Message['content'],
  ): Promise<Message> {
    const membership = await this.memberRepository.findOne({
      where: { chatId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('Нет доступа к этому чату');
    }

    return this.messageRepository.manager.transaction(async (manager) => {
      const messageRepository = manager.getRepository(Message);
      const chatRepository = manager.getRepository(Chat);
      const message = messageRepository.create({
        chatId,
        senderId: userId,
        type,
        content,
      });
      const savedMessage = await messageRepository.save(message);

      await chatRepository.update(chatId, {
        lastMessageAt: savedMessage.createdAt,
      });

      return savedMessage;
    });
  }

  async createSavedMessagesChat(
    user: User,
    manager: EntityManager,
  ): Promise<Chat> {
    const chatRepository = manager.getRepository(Chat);
    const memberRepository = manager.getRepository(ChatMember);

    const chat = chatRepository.create({
      type: ChatType.SAVED_MESSAGES,
      title: 'Избранное',
      ownerId: user.id,
      createdById: user.id,
    });
    const savedChat = await chatRepository.save(chat);

    const member = memberRepository.create({
      chatId: savedChat.id,
      userId: user.id,
      role: ChatMemberRole.OWNER,
    });
    await memberRepository.save(member);

    return savedChat;
  }
}

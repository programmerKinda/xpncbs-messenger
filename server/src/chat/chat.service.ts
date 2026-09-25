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
      .limit(normalizedLimit + 1)

    if (cursor) {
      const cursorDate = new Date(cursor)
      if (!Number.isNaN(cursorDate.getTime())) {
        query.andWhere(
          '(chat.lastMessageAt IS NOT NULL AND chat.lastMessageAt < :cursorDate) OR (chat.lastMessageAt IS NULL AND chat.createdAt < :cursorDate)',
          { cursorDate },
        )
      }
    }

    const members = await query.getMany()
    const hasMore = members.length > normalizedLimit
    const pageMembers = hasMore ? members.slice(0, normalizedLimit) : members

    const items = await Promise.all(
      pageMembers.map(async (member) => {
        const lastMessage = await this.messageRepository.findOne({
          where: { chatId: member.chat.id },
          order: { createdAt: 'DESC' },
        })
        const unreadCount = await this.messageRepository.count({
          where: {
            chatId: member.chat.id,
            senderId: Not(userId),
            ...(member.lastReadAt
              ? { createdAt: MoreThan(member.lastReadAt) }
              : {}),
          },
        })
        const otherMember =
          member.chat.type === ChatType.DIRECT
            ? (
                await this.memberRepository.find({
                  where: { chatId: member.chat.id },
                  relations: { user: true },
                })
              ).find((chatMember) => chatMember.userId !== userId)
            : undefined

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
        }
      }),
    )

    const nextCursor =
      hasMore && pageMembers.length > 0
        ? (pageMembers[pageMembers.length - 1].chat.lastMessageAt ?? pageMembers[pageMembers.length - 1].chat.createdAt).toISOString()
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
      const beforeDate = new Date(before)
      if (!Number.isNaN(beforeDate.getTime())) {
        query.andWhere('message.createdAt < :beforeDate', { beforeDate })
      }
    }

    const rows = await query.getMany()
    const hasMore = rows.length > normalizedLimit
    const pageRows = hasMore ? rows.slice(0, normalizedLimit) : rows

    return {
      items: [...pageRows].reverse(),
      nextCursor:
        hasMore && pageRows.length > 0
          ? pageRows[pageRows.length - 1].createdAt.toISOString()
          : null,
      hasMore,
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

  async createCallMessageForUsers(
    initiatorUserId: string,
    targetUserId: string,
    callId: string,
    type: 'audio' | 'video',
    direction: 'incoming' | 'outgoing',
    status: 'accepted' | 'missed',
    durationSeconds = 0,
  ): Promise<Message[]> {
    const chat = await this.findOrCreateDirectChatForUsers(
      initiatorUserId,
      targetUserId,
    );

    const baseContent = {
      callId,
      direction,
      type,
      status,
      durationSeconds,
    };

    const initiatorMessage = await this.createMessageForUser(
      chat.id,
      initiatorUserId,
      MessageType.CALL,
      baseContent,
    );

    const targetMessage = await this.createMessageForUser(
      chat.id,
      targetUserId,
      MessageType.CALL,
      {
        ...baseContent,
        direction: direction === 'outgoing' ? 'incoming' : 'outgoing',
      },
    );

    return [initiatorMessage, targetMessage];
  }

  async updateCallMessageStatus(
    chatId: string,
    callId: string,
    status: 'accepted' | 'missed',
    durationSeconds = 0,
  ): Promise<void> {
    const messages = await this.messageRepository.find({
      where: { chatId, type: MessageType.CALL },
    });

    const matchingMessages = messages.filter((message) => {
      if (typeof message.content === 'string') return false;
      return (message.content as Record<string, unknown>).callId === callId;
    });

    for (const message of matchingMessages) {
      const nextContent = {
        ...(typeof message.content === 'object' && message.content ? message.content : {}),
        status,
        durationSeconds,
      } as Record<string, unknown>;

      message.content = nextContent as Message['content'];
      await this.messageRepository.save(message);
    }
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

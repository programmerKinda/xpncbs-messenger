jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { ChatService } from './chat.service';
import { ChatType } from './entities/chat.entity';
import { Message, MessageType } from './entities/message.entity';

const createQueryBuilder = (rows: unknown[]) => {
  const queryBuilder = {
    where: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    limit: jest.fn(),
    andWhere: jest.fn(),
    leftJoinAndSelect: jest.fn(),
    innerJoinAndSelect: jest.fn(),
    innerJoin: jest.fn(),
    distinctOn: jest.fn(),
    select: jest.fn(),
    addSelect: jest.fn(),
    groupBy: jest.fn(),
    getMany: jest.fn().mockResolvedValue(rows),
    getRawMany: jest.fn().mockResolvedValue([]),
  }

  for (const method of [
    queryBuilder.where,
    queryBuilder.orderBy,
    queryBuilder.addOrderBy,
    queryBuilder.limit,
    queryBuilder.andWhere,
    queryBuilder.leftJoinAndSelect,
    queryBuilder.innerJoinAndSelect,
    queryBuilder.innerJoin,
    queryBuilder.distinctOn,
    queryBuilder.select,
    queryBuilder.addSelect,
    queryBuilder.groupBy,
  ]) {
    method.mockReturnValue(queryBuilder);
  }

  return queryBuilder;
};

describe('ChatService.upsertCallMessage', () => {
  it('updates a matching call message even when it is not the latest call message', async () => {
    const existingMessage = {
      id: 'message-1',
      chatId: 'chat-1',
      senderId: 'A',
      type: MessageType.CALL,
      content: {
        callId: 'call-1',
        direction: 'outgoing',
        type: 'audio',
        status: 'missed',
        durationSeconds: 0,
      },
    } as unknown as Message;
    const laterMessage = {
      id: 'message-2',
      chatId: 'chat-1',
      type: MessageType.CALL,
      content: { callId: 'call-2' },
    } as unknown as Message;
    const saveMessage = jest.fn((message: Message): Promise<Message> =>
      Promise.resolve(message),
    );
    const messageRepository = {
      find: jest.fn().mockResolvedValue([existingMessage, laterMessage]),
      save: saveMessage,
    };
    const service = new ChatService(
      {} as never,
      {} as never,
      messageRepository as never,
      {} as never,
    );
    jest
      .spyOn(service, 'findOrCreateDirectChatForUsers')
      .mockResolvedValue({ id: 'chat-1' } as never);

    const result = await service.upsertCallMessage(
      'A',
      'B',
      'call-1',
      'audio',
      'accepted',
      12,
    );

    expect(messageRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(existingMessage);
    expect(existingMessage.content).toMatchObject({
      callId: 'call-1',
      status: 'accepted',
      durationSeconds: 12,
    });
  });
});

describe('ChatService.findMessagesForUser', () => {
  it('uses the message id as a tie-breaker in the cursor', async () => {
    const createdAt = new Date('2025-05-25T12:00:00.000Z');
    const rows = [
      { id: 'message-c', createdAt },
      { id: 'message-b', createdAt },
      { id: 'message-a', createdAt },
    ] as Message[];
    const queryBuilder = createQueryBuilder(rows);
    const service = new ChatService(
      { findOne: jest.fn().mockResolvedValue({ chatId: 'chat-1', userId: 'user-1' }) } as never,
      {} as never,
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) } as never,
      {} as never,
    );

    const result = await service.findMessagesForUser(
      'chat-1',
      'user-1',
      2,
      JSON.stringify({ createdAt, id: 'message-d' }),
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('message.id < :beforeId'),
      { beforeDate: createdAt, beforeId: 'message-d' },
    );
    expect(result.items.map((message) => message.id)).toEqual([
      'message-b',
      'message-c',
    ]);
    expect(result.nextCursor).toBe(
      JSON.stringify({ createdAt, id: 'message-b' }),
    );
  });
});

describe('ChatService.findForUser', () => {
  it('uses chat id to continue when chat timestamps are equal', async () => {
    const lastMessageAt = new Date('2025-05-25T12:00:00.000Z');
    const createdAt = new Date('2025-05-20T12:00:00.000Z');
    const chatPageQuery = createQueryBuilder([
      {
        userId: 'user-1',
        chat: {
          id: 'chat-b',
          type: ChatType.GROUP,
          lastMessageAt,
          createdAt,
        },
      },
      {
        userId: 'user-1',
        chat: {
          id: 'chat-a',
          type: ChatType.GROUP,
          lastMessageAt,
          createdAt,
        },
      },
    ]);
    const lastMessagesQuery = createQueryBuilder([]);
    const unreadQuery = createQueryBuilder([]);
    const memberRepository = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(chatPageQuery)
        .mockReturnValue(createQueryBuilder([])),
    };
    const messageRepository = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(lastMessagesQuery)
        .mockReturnValueOnce(unreadQuery),
    };
    const service = new ChatService(
      memberRepository as never,
      {} as never,
      messageRepository as never,
      {} as never,
    );

    const result = await service.findForUser(
      'user-1',
      1,
      JSON.stringify({ lastMessageAt, createdAt, id: 'chat-c' }),
    );

    expect(chatPageQuery.andWhere).toHaveBeenCalledWith(
      expect.stringContaining('chat.id < :cursorId'),
      { cursorLastMessageAt: lastMessageAt, cursorCreatedAt: createdAt, cursorId: 'chat-c' },
    );
    expect(result.items.map((chat) => chat.id)).toEqual(['chat-b']);
    expect(result.nextCursor).toBe(JSON.stringify({ lastMessageAt, createdAt, id: 'chat-b' }));
  });
});

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { ChatService } from './chat.service';
import { Message, MessageType } from './entities/message.entity';

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

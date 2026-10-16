jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));
jest.mock('./chat.service', () => ({
  ChatService: class ChatService {},
}));

import { ChatGateway } from './chat.gateway';

describe('ChatGateway call message lifecycle', () => {
  const createHarness = () => {
    const chatService = {
      findOrCreateDirectChatForUsers: jest
        .fn()
        .mockResolvedValue({ id: 'chat-1' }),
      upsertCallMessage: jest.fn().mockResolvedValue({
        id: 'message-1',
        chatId: 'chat-1',
        senderId: 'A',
      }),
    };
    const gateway = new ChatGateway({} as never, chatService as never);
    const events: Array<{ userId: string; event: string; payload: unknown }> =
      [];
    const emitToUser = (userId: string, event: string, payload: unknown) =>
      events.push({ userId, event, payload });
    (gateway as unknown as { emitToUser: typeof emitToUser }).emitToUser =
      emitToUser;

    const socket = (userId: string) => ({ data: { userId } }) as never;
    const startCall = () => {
      gateway.relayCallOffer(socket('A'), {
        targetUserId: 'B',
        callId: 'call-1',
        type: 'audio',
        offer: {},
        callerName: 'A',
      });
    };
    const acceptCall = () => {
      gateway.relayCallAnswer(socket('B'), {
        targetUserId: 'A',
        callId: 'call-1',
        answer: {},
      });
    };
    const endCall = (userId: string) =>
      gateway.relayCallEnd(socket(userId), {
        targetUserId: userId === 'A' ? 'B' : 'A',
        callId: 'call-1',
      });

    return { chatService, events, startCall, acceptCall, endCall };
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(['A', 'B'])(
    'creates one accepted message authored by A when %s ends the call',
    async (endedByUserId) => {
      jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
      const harness = createHarness();
      harness.startCall();
      expect(harness.chatService.upsertCallMessage).not.toHaveBeenCalled();

      harness.acceptCall();
      jest.advanceTimersByTime(2500);
      await harness.endCall(endedByUserId);

      expect(
        harness.chatService.findOrCreateDirectChatForUsers,
      ).toHaveBeenCalledWith('A', 'B');
      expect(harness.chatService.upsertCallMessage).toHaveBeenCalledTimes(1);
      expect(harness.chatService.upsertCallMessage).toHaveBeenCalledWith(
        'A',
        'B',
        'call-1',
        'audio',
        'accepted',
        2,
      );
      expect(harness.events).toContainEqual({
        userId: endedByUserId === 'A' ? 'B' : 'A',
        event: 'call:ended',
        payload: {
          callId: 'call-1',
          userId: endedByUserId,
          endedByUserId,
        },
      });
      expect(
        harness.events.filter(({ event }) => event === 'message:new'),
      ).toHaveLength(2);
    },
  );

  it('creates one missed message when the callee rejects the ringing call', async () => {
    const harness = createHarness();
    harness.startCall();
    await harness.endCall('B');

    expect(harness.chatService.upsertCallMessage).toHaveBeenCalledTimes(1);
    expect(harness.chatService.upsertCallMessage).toHaveBeenCalledWith(
      'A',
      'B',
      'call-1',
      'audio',
      'missed',
      0,
    );
  });

  it('ignores repeated call:end events for a finalized session', async () => {
    const harness = createHarness();
    harness.startCall();
    await harness.endCall('B');
    await harness.endCall('B');

    expect(harness.chatService.upsertCallMessage).toHaveBeenCalledTimes(1);
    expect(
      harness.events.filter(({ event }) => event === 'call:ended'),
    ).toHaveLength(1);
  });

  it('notifies the peer even when call message persistence fails', async () => {
    const harness = createHarness();
    harness.chatService.upsertCallMessage.mockRejectedValueOnce(
      new Error('database unavailable'),
    );
    harness.startCall();
    await harness.endCall('A');

    expect(harness.events).toContainEqual({
      userId: 'B',
      event: 'call:ended',
      payload: {
        callId: 'call-1',
        userId: 'A',
        endedByUserId: 'A',
      },
    });
    expect(
      harness.events.filter(({ event }) => event === 'message:new'),
    ).toHaveLength(0);
  });
});

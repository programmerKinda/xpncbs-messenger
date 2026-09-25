import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  type: MessageType = MessageType.TEXT;
  content!: string;
}

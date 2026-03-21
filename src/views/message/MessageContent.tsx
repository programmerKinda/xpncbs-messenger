import { MessageText } from './MessageText'
import { MessageVoice } from './MessageVoice'
import { type MessageVoiceContent } from '@/models/message'
const MessageContent = {
  text: ({ content }: { content: string }) => <MessageText content={content} />,
  voice: ({ content }: { content: MessageVoiceContent }) => <MessageVoice content={content} />,
} as const

export default MessageContent

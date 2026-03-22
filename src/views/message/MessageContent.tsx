import { MessageText } from './MessageText'
import { MessageVoice } from './MessageVoice'
import { type MessageVoiceContent } from '@/models/message'
import { MessageCircle } from './MessageCircle'
import { type MessageCircleContent } from '@/models/message'
const MessageContent = {
  text: ({ content }: { content: string }) => <MessageText content={content} />,
  voice: ({ content }: { content: MessageVoiceContent }) => <MessageVoice content={content} />,
  file: ({ content }: { content: string }) => <MessageText content={content} />,
  circle: ({ content }: { content: MessageCircleContent }) => <MessageCircle content={content} />,
} as const

export default MessageContent

import { MessageText } from './MessageText'
import { MessageVoice } from './MessageVoice'
import { type MessageVoiceContent, type MessageCallContent } from '@/models/message'
import { MessageCircle } from './MessageCircle'
import { type MessageCircleContent } from '@/models/message'
import { Phone, PhoneOff, Video } from 'lucide-react'

export const MessageCall: React.FC<{ content: MessageCallContent }> = ({ content }) => {
  const isMissed = content.status === 'missed'
  const isVideo = content.type === 'video'
  const Icon = isMissed ? PhoneOff : isVideo ? Video : Phone
  const directionLabel = content.direction === 'incoming' ? 'Входящий' : 'Исходящий'
  const kindLabel = isVideo ? 'видеозвонок' : 'звонок'
  const statusLabel = isMissed ? 'Пропущен' : 'Завершён'

  return (
    <div className="message-call">
      <div className={`message-call__icon ${isMissed ? 'message-call__icon--missed' : ''}`}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="message-call__body">
        <span className="message-call__title">{directionLabel} {kindLabel}</span>
        <span className="message-call__meta">
          {statusLabel} · {content.durationSeconds}s
        </span>
      </div>
    </div>
  )
}

const MessageContent = {
  text: ({ content, onMention }: { content: string; onMention?: (username: string) => void }) => (
    <MessageText content={content} onMention={onMention} />
  ),
  voice: ({
    content,
    autoPlay,
    onEnded,
  }: {
    content: MessageVoiceContent
    autoPlay?: boolean
    onEnded?: () => void
  }) => <MessageVoice content={content} autoPlay={autoPlay} onEnded={onEnded} />,
  file: ({ content }: { content: string }) => <MessageText content={content} />,
  circle: ({
    content,
    autoPlay,
    onEnded,
  }: {
    content: MessageCircleContent
    autoPlay?: boolean
    onEnded?: () => void
  }) => <MessageCircle content={content} autoPlay={autoPlay} onEnded={onEnded} />,
  call: ({ content }: { content: MessageCallContent }) => <MessageCall content={content} />,
} as const

export default MessageContent

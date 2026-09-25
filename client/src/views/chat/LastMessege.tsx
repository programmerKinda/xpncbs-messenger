import { messageTypes } from '@/models/message'

interface LastMessageProps {
  type: (typeof messageTypes)[number]
  content: string | Record<string, unknown>
}

const formatCallPreview = (content: string | Record<string, unknown>) => {
  if (typeof content !== 'object' || content === null) return 'Звонок'

  const callType = typeof content.type === 'string' && content.type === 'video' ? 'видеозвонок' : 'звонок'
  const direction = typeof content.direction === 'string' && content.direction === 'incoming' ? 'Входящий' : 'Исходящий'
  const status = typeof content.status === 'string' && content.status === 'missed' ? 'пропущен' : 'завершён'

  return `${direction} ${callType} (${status})`
}

export default function LastMessage({ type, content }: LastMessageProps) {
  return (
    <div className="last-message">
      <p className="last-message__text">
        {type === 'text' && typeof content === 'string' ? content : null}
        {type === 'voice' && 'Голосовое сообщение'}
        {type === 'circle' && 'Круговое сообщение'}
        {type === 'file' && 'Файл'}
        {type === 'call' && formatCallPreview(content)}
      </p>
    </div>
  )
}

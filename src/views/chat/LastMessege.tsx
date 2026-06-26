import { messageTypes } from '@/models/message'
interface LastMessageProps {
  type: (typeof messageTypes)[number]
  content: string
}
export default function LastMessage({ type, content }: LastMessageProps) {
  return (
    <div className="last-message">
      <p className="last-message__text">
        {type === 'text' && content}
        {type === 'voice' && 'Голосовое сообщение'}
        {type === 'circle' && 'Круговое сообщение'}
        {type === 'file' && 'Файл'}
      </p>
    </div>
  )
}

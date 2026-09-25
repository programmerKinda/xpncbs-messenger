import {
  type MessageCallContent,
  type MessageCircleContent,
  type MessageProps,
  type MessageVoiceContent,
} from '@/models/message'
import { formatTime } from '@/utils/formatTime'
import MessageContent from './MessageContent'
import { Check, CheckCheck } from 'lucide-react'

const Message: React.FC<MessageProps> = ({ message, className, onMention, onMediaEnded, autoPlay }) => {
  const timeString = formatTime(message.createdAt)
  const isOutgoing = className?.includes('message--outgoing') ?? false
  const content = (() => {
    switch (message.type) {
      case 'text':
        return MessageContent.text({ content: message.content as string, onMention })
      case 'voice':
        return MessageContent.voice({
          content: message.content as MessageVoiceContent,
          autoPlay,
          onEnded: () => onMediaEnded?.(message.uuid),
        })
      case 'circle':
        return MessageContent.circle({
          content: message.content as MessageCircleContent,
          autoPlay,
          onEnded: () => onMediaEnded?.(message.uuid),
        })
      case 'file':
        return MessageContent.file({ content: message.content as string })
      case 'call':
        return MessageContent.call({ content: message.content as MessageCallContent })
      default:
        return MessageContent.text({ content: typeof message.content === 'string' ? message.content : 'Сообщение' })
    }
  })()
  const messageClassName = [
    'message',
    className,
    message.type === 'circle' ? 'circle' : '',
    message.type === 'voice' ? 'message--voice' : '',
    message.type === 'call' ? 'message--call' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={messageClassName}>
      {/* <header className='message__header'></header> */}
      <div className="message-content">
        {content}
      </div>
      <footer className="message__footer">
        {message.updated && <span>Изменено</span>}
        <div className="message__meta">
          <span className="message__time">{timeString}</span>
          {isOutgoing && message.type !== 'circle' && (
            <span className="message__status-icon">
              {message.watched ? (
                <>
                  <span className="tick-1">
                    <CheckCheck size={14} strokeWidth={2} className="inline" />
                  </span>
                </>
              ) : (
                <>
                  <span className="tick-1">
                    <Check size={12} strokeWidth={2} className="inline" />
                  </span>
                </>
              )}
            </span>
          )}
        </div>
      </footer>
    </div>
  )
}
export default Message

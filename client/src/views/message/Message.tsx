import { type MessageProps, messageTypes } from '@/models/message'
import { formatTime } from '@/utils/formatTime'
import MessageContent from './MessageContent'
import { Check, CheckCheck } from 'lucide-react'

const Message: React.FC<MessageProps> = ({ message, className }) => {
  const timeString = formatTime(message.createdAt)
  return (
    <div className={`message ${className || ''} ${message.type === 'circle' ? ' circle' : ''}`}>
      {/* <header className='message__header'></header> */}
      <div className="message-content">
        {messageTypes.includes(message.type) &&
          MessageContent[message.type]({ content: message.content as any })}
      </div>
      <footer className="message__footer">
        {message.updated && <span>Изменено</span>}
        <div className="message__meta">
          <span className="message__time">{timeString}</span>
          {message.type !== 'circle' && (
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

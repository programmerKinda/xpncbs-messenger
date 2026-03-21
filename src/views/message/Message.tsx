import { type MessageProps, messageTypes } from '@/models/message'
import { formatTime } from '@/utils/formatTime'
import MessageContent from './MessageContent'
const Message: React.FC<MessageProps> = ({ message }) => {
  const timeString = formatTime(message.createdAt)
  return (
    <div className="message message--outgoing ">
      {/* <header className='message__header'></header> */}
      <div className="message-content">
        {messageTypes.includes(message.type) &&
          MessageContent[message.type]({ content: message.content as any })}
      </div>
      <footer className="message__footer">
        {message.updated && <span>Изменено</span>}
        <div className="message__meta">
          <span className="message__time">{timeString}</span>
          <span className="message__status-icon">
            {message.watched ? (
              <>
                <span className="tick-1">✓</span>
                <span className="tick-2">✓</span>
              </>
            ) : (
              <>
                <span className="tick-1">✓</span>
              </>
            )}
          </span>
        </div>
      </footer>
    </div>
  )
}
export default Message

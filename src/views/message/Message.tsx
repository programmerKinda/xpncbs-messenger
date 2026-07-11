import { type MessageProps, messageTypes } from '@/models/message'
import { formatTime } from '@/utils/formatTime'
import MessageContent from './MessageContent'
import { FaCheck } from "react-icons/fa6";
import { IoCheckmarkDone } from "react-icons/io5";

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
                  <span className="tick-1"><IoCheckmarkDone size={14} className='inline'/></span>
                  
                </>
              ) : (
                <>
                  <span className="tick-1"><FaCheck size={12} className='inline'/></span>
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

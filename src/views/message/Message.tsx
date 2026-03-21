import { type MessageProps, messageTypes } from '@/models/message'
import MessageContent from './MessageContent'
const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="message">
      {/* <header className='message__header'></header> */}
      <div className="message-content">
        {messageTypes.includes(message.type) &&
          MessageContent[message.type]({ content: message.content as string })}
      </div>
      <footer className="message__footer">
        {message.updated && <span>Изменено</span>}
        <div>
          <span className="message__time">
            {message.createdAt.getHours()}:{message.createdAt.getMinutes()}
          </span>
          <span>{message.watched ? 'Прочитано' : ''}</span>
        </div>
      </footer>
    </div>
  )
}
export default Message

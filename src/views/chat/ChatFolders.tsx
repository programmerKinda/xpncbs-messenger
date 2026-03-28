import { type ChatFolder } from '@/models/chat/ChatFolders'
import { AddChatFolderButton } from './AddChatFolderButton'
interface ChatFoldersProps {
  chatFolders: ChatFolder[]
}
const ChatFolders: React.FC<ChatFoldersProps> = ({ chatFolders }) => {
  return (
    <ul className="chat-folders">
      {chatFolders.map((el) => (
        <li className="chat-folder" key={el.id}>
          {el.name}
        </li>
      ))}
      <li className="chat-folders__sticky-item">
        <AddChatFolderButton />
      </li>
    </ul>
  )
}
export default ChatFolders

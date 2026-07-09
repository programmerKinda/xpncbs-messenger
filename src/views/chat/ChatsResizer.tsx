import { type ChatsWidth } from '@/models/chat/chats'
import { startResizing,endResizing } from '@/controllers/chatsWidthController'

export const ChatsResizer: React.FC<ChatsWidth> = ({ chatsWidth, setChatsWidth }) => {
  return (
    <div
      onMouseDown={(e) => startResizing(e, { chatsWidth, setChatsWidth })}
      onMouseUp={(e) => endResizing(e, { chatsWidth, setChatsWidth, startWidth: 0})}
      className="chats__resizer"
    />
  )
}

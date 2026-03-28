import { type ChatsWidth } from '@/models/chat/chats'
import { startResizing } from '@/controllers/chatsWidthController'
export const ChatsResizer: React.FC<ChatsWidth> = ({ chatsWidth, setChatsWidth }) => {
  return (
    <div
      onMouseDown={(e) => startResizing(e, { chatsWidth, setChatsWidth })}
      className="chats__resizer"
    />
  )
}

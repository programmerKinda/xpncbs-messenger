import { type ChatsResizerProps } from '@/models/chat/chats'
import { startResizing } from '@/controllers/chatsWidthController'

export const ChatsResizer: React.FC<ChatsResizerProps> = ({ chatsWidth, setChatsWidth }) => {
  return (
    <div
      onMouseDown={(e) => startResizing(e, { chatsWidth, setChatsWidth })}
      className="chats__resizer"
    />
  )
}

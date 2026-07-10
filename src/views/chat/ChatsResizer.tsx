import { type ChatsResizerProps } from '@/models/chat/chats'
import { startResizing } from '@/controllers/chatsWidthController'

export const ChatsResizer: React.FC<ChatsResizerProps> = ({ chatsWidth, setChatsWidth, onResizeMove, onResizeStart, onResizeEnd, canCollapse }) => {
  return (
    <div
      onMouseDown={(e) => startResizing(e, { chatsWidth, setChatsWidth, onResizeMove, onResizeStart, onResizeEnd, canCollapse })}
      className="chats__resizer"
    />
  )
}

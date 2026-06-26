import UserAvatar from '../user/UserAvatar'
import UserName from '../user/UserName'
import LastMessage from './LastMessege'
import { formatTime } from '@/utils/formatTime'

interface ItemChatProps {
  createdAt: Date
  watched: boolean
}
export default function ItemChat({ createdAt, watched }: ItemChatProps) {
  const timeString = formatTime(createdAt)
  return (
    <div className="item-chat">
      <UserAvatar name="x p" avatarURL="" />

      <div className="item-chat__info">
        <UserName name="x p" phone="123-456-7890" contactName="" />
        <LastMessage
          type="text"
          content="Привет, кк дела?ssssssssssssssssssssssssssssssssssssssssssssssssssssssss"
        />
      </div>
      <span className="message__status-icon">
        {watched ? (
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
      <span className="item-chat__time">{timeString}</span>
    </div>
  )
}

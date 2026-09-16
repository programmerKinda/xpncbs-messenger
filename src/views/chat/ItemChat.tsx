import UserAvatar from '../user/UserAvatar'
import UserName from '../user/UserName'
import LastMessage from './LastMessege'
import { formatTime } from '@/utils/formatTime'
import { Check, CheckCheck } from 'lucide-react'

interface ItemChatProps {
  createdAt: Date
  watched: boolean
}
export default function ItemChat({ createdAt, watched }: ItemChatProps) {
  const timeString = formatTime(createdAt)
  return (
    <div className="item-chat">
      <UserAvatar name="e o" avatarURL="" />

      <div className="item-chat__info">
        <div className="item-chat__header">
          <UserName name="xsSADADADADADAD p" phone="123-456-7890" contactName="" />

          <span className="item-chat__status">
            <span className="message__status-icon">
              {watched ? (
                <>
                  <CheckCheck size={14} strokeWidth={2} className="inline tick-1" />
                </>
              ) : (
                <>
                  <Check size={14} strokeWidth={2} className="inline tick-1" />
                </>
              )}
            </span>
            <span className="item-chat__time">{timeString}</span>
          </span>
        </div>
        <LastMessage
          type="text"
          content="Привет, кк дела?ssssssssssssssssssssssssssssssssssssssssssssssssssssssss"
        />
      </div>
    </div>
  )
}

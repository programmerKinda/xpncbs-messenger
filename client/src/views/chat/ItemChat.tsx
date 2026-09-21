import UserAvatar from '../user/UserAvatar'
import UserName from '../user/UserName'
import LastMessage from './LastMessege'
import { formatTime } from '@/utils/formatTime'
import { Check, CheckCheck } from 'lucide-react'

interface ItemChatProps {
  createdAt: Date
  watched: boolean
  name?: string
  message?: string
  onClick?: () => void
}
export default function ItemChat({
  createdAt,
  watched,
  name = 'Анна Кузнецова',
  message = 'Привет! Как проходит день?',
  onClick,
}: ItemChatProps) {
  const timeString = formatTime(createdAt)
  return (
    <button type="button" className="item-chat" onClick={onClick}>
      <UserAvatar name={name} avatarURL="" />

      <div className="item-chat__info">
        <div className="item-chat__header">
          <UserName name={name} phone="" contactName="" />

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
        <LastMessage type="text" content={message} />
      </div>
    </button>
  )
}

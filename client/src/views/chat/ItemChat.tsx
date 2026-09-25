import UserAvatar from '../user/UserAvatar'
import UserName from '../user/UserName'
import LastMessage from './LastMessege'
import { formatTime } from '@/utils/formatTime'
import { CheckCheck } from 'lucide-react'

interface ItemChatProps {
  id:string
  createdAt: Date
  watched: boolean
  name?: string
  message?: string
  messageType?: 'text' | 'voice' | 'circle' | 'file' | 'call'
  avatarURL?: string
  unreadCount?: number
  onClick?: () => void
}
export default function ItemChat({
  id,
  createdAt,
  watched,
  name = 'Анна Кузнецова',
  message = 'Привет! Как проходит день?',
  messageType = 'text',
  avatarURL = '',
  unreadCount = 0,
  onClick,
}: ItemChatProps) {
  const timeString = formatTime(createdAt)
  return (
    <button type="button" className="item-chat" onClick={onClick}>
      <UserAvatar id={id} name={name} avatarURL={avatarURL} />

      <div className="item-chat__info">
        <div className="item-chat__header">
          <UserName name={name} phone="" contactName="" />

          <span className="item-chat__status">
            {watched && (
              <span className="message__status-icon">
                <CheckCheck size={14} strokeWidth={2} className="inline tick-1" />
              </span>
            )}
            {unreadCount > 0 ? (
              <span className="item-chat__unread-count">{unreadCount}</span>
            ) : (
              <span className="item-chat__time">{timeString}</span>
            )}
          </span>
        </div>
        <LastMessage type={messageType} content={message} />
      </div>
    </button>
  )
}

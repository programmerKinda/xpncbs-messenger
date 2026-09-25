import UserAvatar from '../user/UserAvatar'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

interface CallItemProps {
  id:string
  name: string
  phone: string
  time: string // Передавай сюда уже готовую строку: время или дату
  direction: 'incoming' | 'outgoing'
  callType: React.ReactNode
  status: 'accepted' | 'missed'
}

export default function CallItem({id, name, direction, time, callType }: CallItemProps) {
  return (
    <div className="call-item">
      <div className="call-item__avatar">
        <UserAvatar id={id} name={name} avatarURL="" />
      </div>

      <div className="call-item__content">
        <div className="call-item__meta">
          <div className="call-item__main">
            <div className="call-item__name">{name}</div>

            <div className="call-item__footer">
              <span className="call-item__status">
                {direction === 'incoming' ? (
                  <ArrowDownLeft size={14} strokeWidth={2} />
                ) : (
                  <ArrowUpRight size={14} strokeWidth={2} />
                )}
              </span>

              <span className="call-item__direction">
                {direction === 'incoming' ? 'Входящий' : 'Исходящий'}
              </span>
            </div>
          </div>

          <div className="call-item__right">
            <span className="call-item__time">{time}</span>

            <button className="call-item__type">{callType}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

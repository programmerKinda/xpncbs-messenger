import UserAvatar from '../user/UserAvatar'
import { ImArrowDownLeft2, ImArrowUpRight2 } from 'react-icons/im'

interface CallItemProps {
  name: string
  phone: string
  time: string // Передавай сюда уже готовую строку: время или дату
  direction: 'incoming' | 'outgoing'
  callType: React.ReactNode
  status: 'accepted' | 'missed'
}

export default function CallItem({ name, direction, time, callType }: CallItemProps) {
  return (
    <div className="call-item">
      <div className="call-item__avatar">
        <UserAvatar name={name} avatarURL="" />
      </div>

      <div className="call-item__content">
        <div className="call-item__meta">
          <div className="call-item__main">
            <div className="call-item__name">{name}</div>

            <div className="call-item__footer">
              <span className="call-item__status">
                {direction === 'incoming' ? (
                  <ImArrowDownLeft2 size={12} color="#32D583" />
                ) : (
                  <ImArrowUpRight2 size={12} color="#FF5D73" />
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

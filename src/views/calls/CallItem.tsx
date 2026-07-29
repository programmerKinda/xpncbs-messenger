import UserAvatar from '../user/UserAvatar'
import { HiPhone } from "react-icons/hi2";

interface CallItemProps {
  name: string
  phone: string
  time: string
  direction: 'incoming' | 'outgoing'
  callType: React.ReactNode
  status: 'accepted' | 'missed'
}

export default function CallItem({ name, phone, time,callType }: CallItemProps) {
  return (
    <div className="call-item">
      <div className="call-item__avatar">
        <UserAvatar name={name} avatarURL="" />
      </div>

      <div className="call-item__content">
        <div className="call-item__meta">
          <div className="call-item__main">
            <div className="call-item__name ">{name}</div>
            {/* <div className="call-item__phone">{phone}</div> */}
            <span className="call-item__time">{time}</span>
          </div>
          <button>{callType}</button>
        </div>
      </div>
    </div>
  )
}

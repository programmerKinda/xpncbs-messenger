import UserAvatar from '../user/UserAvatar'

interface CallItemProps {
  name: string
  phone: string
  time: string
  direction: 'incoming' | 'outgoing'
  callType: 'audio' | 'video'
  status: 'accepted' | 'missed'
}

export default function CallItem({ name, phone, time }: CallItemProps) {
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
        </div>
      </div>
    </div>
  )
}

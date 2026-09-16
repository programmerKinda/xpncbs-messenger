import CommonSidebar from '@/shared/components/CommonSidebar'
import CallItem from '@/views/calls/CallItem'
import { Phone, Video, PhoneCall, UsersRound, MoreHorizontal } from 'lucide-react'
import '@/styles/components/calls.css'
export default function Calls() {
  return (
    <>
      <CommonSidebar
        title="Звонки"
        resize={true}
        bodyContent={
          <div className="calls-page">
            <CallItem
              name="Анна К."
              phone="+7 999 123-45-67"
              time="Сегодня, 14:20"
              direction="incoming"
              status="accepted"
              callType={<Phone size={22} strokeWidth={2} />}
            />
            <CallItem
              name="Максим"
              phone="+7 900 555-12-34"
              time="Вчера, 21:05"
              direction="outgoing"
              callType={<Video size={22} strokeWidth={2} />}
              status="missed"
            />
            <CallItem
              name="Ольга"
              phone="+7 915 000-11-22"
              time="Вчера, 09:40"
              direction="incoming"
              callType={<Video size={22} strokeWidth={2} />}
              status="accepted"
            />
          </div>
        }
        popupButton={{
          icon: <MoreHorizontal size={24} strokeWidth={2} />,
          menuItems: [
            {
              label: 'Новый звонок',
              icon: <PhoneCall size={20} strokeWidth={2} />,
              onClick: () => console.log('Новый звонок'),
            },
            {
              label: 'Новая конференция',
              icon: <UsersRound size={20} strokeWidth={2} />,
              onClick: () => console.log('Новая конференция'),
            },
          ],
        }}
      />
    </>
  )
}

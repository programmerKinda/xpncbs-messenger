import CommonSidebar from '@/shared/components/CommonSidebar'
import CallItem from '@/views/calls/CallItem'
import { PiPhonePlusFill } from "react-icons/pi";
import { FaUserTie } from "react-icons/fa";
import { BsFillTelephonePlusFill } from "react-icons/bs";
import { IoEllipsisVertical } from "react-icons/io5";
import { IoVideocam } from "react-icons/io5";
import { HiPhone } from "react-icons/hi2";
import '@/styles/components/calls.css'
import { IoEllipsisHorizontal } from "react-icons/io5";
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
              callType={<HiPhone size={23} color='#6B7280'/>}
            />
            <CallItem
              name="Максим"
              phone="+7 900 555-12-34"
              time="Вчера, 21:05"
              direction="outgoing"
              callType={<IoVideocam size={25} color='#6B7280'/>}
              status="missed"
              
            />
            <CallItem
              name="Ольга"
              phone="+7 915 000-11-22"
              time="Вчера, 09:40"
              direction="incoming"
              callType={<IoVideocam size={25} color='#6B7280'/> }
              status="accepted"
            />
          </div>
        }
                  popupButton=
                   {{
                icon: <IoEllipsisHorizontal size={35}/>,
                menuItems: [
                  {
                    label: 'Новый звонок',
                    icon: <BsFillTelephonePlusFill />,
                    onClick: () => console.log('Новый звонок'),
                  },
                  {
                    label: 'Новая конференция',
                    icon: <FaUserTie />,
                    onClick: () => console.log('Новая конференция'),
                  },
                ],
              }}
      />
    </>
  )
}

import CommonSidebar from '@/shared/components/CommonSidebar'
import CallItem from '@/views/calls/CallItem'
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
              callType="audio"
              status="accepted"
            />
            <CallItem
              name="Максим"
              phone="+7 900 555-12-34"
              time="Вчера, 21:05"
              direction="outgoing"
              callType="video"
              status="missed"
            />
            <CallItem
              name="Ольга"
              phone="+7 915 000-11-22"
              time="Вчера, 09:40"
              direction="incoming"
              callType="audio"
              status="accepted"
            />
          </div>
        }
      />
    </>
  )
}

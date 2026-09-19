import CommonSidebar from '@/shared/components/CommonSidebar'
import { MoreVertical } from 'lucide-react'
export default function Contacts() {
  return (
    <>
      <CommonSidebar
        title="Контакты"
        resize={true}
        bodyContent={
          <>
            <div></div>
          </>
        }
        popupButton={{
          icon: <MoreVertical size={22} strokeWidth={2} />,
          menuItems: [],
        }}
      />
    </>
  )
}

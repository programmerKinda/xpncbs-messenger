import CommonSidebar from '@/shared/components/CommonSidebar'
import { IoEllipsisVertical } from 'react-icons/io5'
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
        popupButton=
           {{
        icon: <IoEllipsisVertical size={25}/>,
        menuItems: [
     
        ],
      }}
        
      />


    </>
  )
}



import CommonSidebar from '@/shared/components/CommonSidebar'
import { IoPersonAddSharp } from 'react-icons/io5'
import { PopupProvider } from '@/shared/components/PopupProvider'

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
        icon: <IoPersonAddSharp />,
        menuItems: [
          {
            label: 'Новый звонок',
            icon: <IoPersonAddSharp />,
            onClick: () => console.log('Новый звонок'),
          },
          {
            label: 'Новая конференция',
            icon: <IoPersonAddSharp />,
            onClick: () => console.log('Новая конференция'),
          },
        ],
      }}
        
      />


    </>
  )
}



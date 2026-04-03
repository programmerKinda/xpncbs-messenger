import { EllipsisVertical } from 'lucide-react'
import { useRef } from 'react'
import { usePopupStore } from '@/controllers/popupController'
import Menu from '@/shared/components/menu'
import Popup from '@/shared/components/Popup'
import {LogOut,Settings, User } from 'lucide-react'
export const ChatsMenuButton = () => {
  const targetRef = useRef(null)
  const { setTargetRef, setChildren } = usePopupStore()
  const handleClick = () => {
    setTargetRef(targetRef)
    setChildren(
       <Popup>
          
          <Menu items={[
            {icon: <User />, label: 'Профиль', onClick: () => console.log('Профиль') },
            {icon: <Settings />, label: 'Настройки', onClick: () => console.log('Настройки') },
            {icon: <LogOut />, label: 'Выход', onClick: () => console.log('Выход') }
          ]} />
        </Popup> 
    )
  }

  return (
    <button className="chats__menu-btn" onClick={handleClick} ref={targetRef}>
      <EllipsisVertical color="black" size={20} />
    </button>
  )
}

import { EllipsisVertical, LogOut, Settings, User } from 'lucide-react'
import { useRef } from 'react'
import { usePopupStore } from '@/controllers/popupController'
import Menu from '@/shared/components/menu'

export const ChatsMenuButton = () => {
  const targetRef = useRef<HTMLButtonElement | null>(null)

  const { setTargetRef, setChildren } = usePopupStore()

  const handleClick = () => {
    if (!targetRef.current) return

    setTargetRef(targetRef as React.RefObject<HTMLElement>)

    setChildren(
      <Menu
        items={[
          {
            icon: <User />,
            label: 'Профиль',
            onClick: () => console.log('Профиль'),
          },
          {
            icon: <Settings />,
            label: 'Настройки',
            onClick: () => console.log('Настройки'),
          },
          {
            icon: <LogOut />,
            label: 'Выход',
            onClick: () => console.log('Выход'),
          },
        ]}
      />
    )
  }

  return (
    <button className="chats__menu-btn" onClick={handleClick} ref={targetRef}>
      <EllipsisVertical size={20} />
    </button>
  )
}

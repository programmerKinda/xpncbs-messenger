import { EllipsisVertical, LogOut, Settings, User } from 'lucide-react'
import { useRef } from 'react'
import { usePopupStore } from '@/controllers/popupController'
import Menu from '@/shared/components/menu'
import { PopupWrap } from '@/shared/components/popupWrap'
export const ChatsMenuButton = () => {
  const target = useRef<HTMLButtonElement | null>(null)

  const { targetRef, onClose, setTargetRef, setChildren } = usePopupStore()

  const handleClick = () => {
    if (!target.current) return

    if (targetRef === target) {
      onClose()
      return
    }

    setTargetRef(target as React.RefObject<HTMLElement>)

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
    <PopupWrap>
      <button ref={target} onClick={handleClick} className="chats-menu-button">
        <EllipsisVertical />
      </button>
    </PopupWrap>
  )
}

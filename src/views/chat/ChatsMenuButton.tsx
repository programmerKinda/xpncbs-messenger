import { EllipsisVertical, LogOut, Settings, User } from 'lucide-react'
import Menu from '@/shared/components/menu'
import { PopupProvider } from '@/shared/components/PopupProvider'

export const ChatsMenuButton = () => {
  return (
    <PopupProvider
      placement="bottom"
      align="start"
      popup={
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
      }
    >
      <button className="chats-menu-button">
        <EllipsisVertical />
      </button>
    </PopupProvider>
  )
}

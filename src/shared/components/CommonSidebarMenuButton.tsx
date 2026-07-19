import { Menu as MenuButton, LogOut, Settings, User } from 'lucide-react'
import Menu from '@/shared/components/menu'
import { PopupProvider } from '@/shared/components/PopupProvider'

export const CommonSidebarMenuButton = () => {
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
      <button className="common-sidebar-menu-button">
        <MenuButton />
      </button>
    </PopupProvider>
  )
}

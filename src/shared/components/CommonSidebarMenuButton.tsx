
import Menu from '@/shared/components/menu'

import { PopupProvider } from '@/shared/components/PopupProvider'
import type{commonSidebarMenuButtonProps} from '@/models/shared/commonSidebarMenuButton'
export const CommonSidebarMenuButton = ({icon, menuItems}: commonSidebarMenuButtonProps) => {

  return (
    <PopupProvider
      placement="bottom"
      align="start"
      popup={
        <Menu
          items={menuItems}
        />
      }
    >
      <button className="common-sidebar-menu-button">
        {icon}
      </button>
    </PopupProvider>
  )
}


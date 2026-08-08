import Sidebar from '../sidebar/Sidebar'
import { Outlet } from 'react-router-dom'
import SidebarSettings from '../sidebars/SidebarSettings'
function SettingLayout() {
  return (
    <section className="main-layout">
      <Sidebar />
      <SidebarSettings />
      <Outlet />
    </section>
  )
}

export default SettingLayout

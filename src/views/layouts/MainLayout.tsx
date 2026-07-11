import Sidebar from '../sidebar/Sidebar'
import { Outlet } from 'react-router-dom'
function MainLayout() {

  return (
    <section className="main-layout">
      <Sidebar />
        <Outlet />
    </section>
  )
}

export default MainLayout

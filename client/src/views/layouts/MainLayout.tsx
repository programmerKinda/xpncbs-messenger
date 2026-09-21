import Sidebar from '../sidebar/Sidebar'
import { Outlet } from 'react-router-dom'
import { useChatMenuStore } from '../../controllers/chatMenuController'
function MainLayout() {
  const isChatOpen = useChatMenuStore((state) => state.isChatOpen)

  return (
    <section className={`main-layout ${isChatOpen ? 'main-layout--chat-open' : ''}`}>
      <Sidebar />
      <Outlet />
    </section>
  )
}

export default MainLayout

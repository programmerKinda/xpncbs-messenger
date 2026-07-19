import ChatSidebar from '../shared/components/ChatSidebar'
import ChatWindow from '../views/chat/ChatWindow'
import ChatMenu from '../views/chat/ChatMenu'
import { useChatMenuStore } from '../controllers/chatMenuController'

function MainPage() {
  const { isOpen } = useChatMenuStore()

  return (
    <section className={`App ${isOpen ? '' : 'App--menu-closed'}`}>
      <ChatSidebar />
      <ChatWindow />
      <ChatMenu />
    </section>
  )
}
export default MainPage

import { useEffect, useState } from 'react'
import ChatSidebar from '../shared/components/ChatSidebar'
import ChatWindow from '../views/chat/ChatWindow'
import ChatMenu from '../views/chat/ChatMenu'
import { useChatMenuStore } from '../controllers/chatMenuController'
import { useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

function MainPage() {
  const { isOpen, isChatOpen } = useChatMenuStore()
  const location = useLocation()
  const isChatRoute = location.pathname.startsWith('/chat/')
  const chatIsOpen = isChatOpen || isChatRoute
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 560)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 560px)')
    const updateMobileState = () => setIsMobile(mediaQuery.matches)

    updateMobileState()
    mediaQuery.addEventListener('change', updateMobileState)

    return () => mediaQuery.removeEventListener('change', updateMobileState)
  }, [])

  if (isMobile) {
    return (
      <section
        className={`App ${isOpen ? '' : 'App--menu-closed'} ${chatIsOpen ? 'App--chat-open' : ''}`}
      >
        {!chatIsOpen ? <ChatSidebar /> : <ChatWindow />}
        {isOpen && <ChatMenu />}
      </section>
    )
  }

  return (
    <section
      className={`App ${isOpen ? '' : 'App--menu-closed'} ${chatIsOpen ? 'App--chat-open' : ''}`}
    >
      <ChatSidebar />
      {chatIsOpen ? (
        <ChatWindow />
      ) : (
        <section className="chat-empty-state" aria-label="Чат не выбран">
          <MessageCircle size={28} strokeWidth={1.8} />
          <p>Выберите, кому хотели бы написать</p>
        </section>
      )}
      <ChatMenu />
    </section>
  )
}
export default MainPage

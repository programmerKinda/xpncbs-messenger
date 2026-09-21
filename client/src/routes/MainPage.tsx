import { useEffect, useState } from 'react'
import ChatSidebar from '../shared/components/ChatSidebar'
import ChatWindow from '../views/chat/ChatWindow'
import ChatMenu from '../views/chat/ChatMenu'
import { useChatMenuStore } from '../controllers/chatMenuController'

function MainPage() {
  const { isOpen, isChatOpen } = useChatMenuStore()
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
      <section className={`App ${isOpen ? '' : 'App--menu-closed'} ${isChatOpen ? 'App--chat-open' : ''}`}>
        {!isChatOpen ? <ChatSidebar /> : <ChatWindow />}
        {isOpen && <ChatMenu />}
      </section>
    )
  }

  return (
    <section className={`App ${isOpen ? '' : 'App--menu-closed'} ${isChatOpen ? 'App--chat-open' : ''}`}>
      <ChatSidebar />
      <ChatWindow />
      <ChatMenu />
    </section>
  )
}
export default MainPage

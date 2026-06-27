import Sidebar from './views/sidebar/Sidebar'
import Chats from './views/chat/Chats'
import { useRef } from 'react'
import { usePopupStore } from './controllers/popupController'
import Popup from './shared/components/Popup'
import { useEffect } from 'react'
import ChatWindow from './views/chat/ChatWindow'
import ChatMenu from './views/chat/ChatMenu'
import { useChatMenuStore } from './controllers/chatMenuController'
import Modal from './shared/components/Modal'
import { useModalStore } from './controllers/modalController'
function App() {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const { targetRef, children, onClose, placement, align } = usePopupStore()
  const { modalChildren } = useModalStore()

  const { isOpen } = useChatMenuStore()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (targetRef && targetRef.current && targetRef.current.contains(event.target as Node)) {
        return
      }
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [targetRef, onClose])

  return (
    <section className={`App ${isOpen ? '' : 'App--menu-closed'}`}>
      <Sidebar />
      <Chats />
      <ChatWindow />
      <ChatMenu />
      {targetRef && children && (
        <Popup ref={popupRef} targetRef={targetRef} placement={placement} align={align}>
          {children}
        </Popup>
      )}
      {modalChildren && <Modal>{modalChildren}</Modal>}
    </section>
  )
}

export default App

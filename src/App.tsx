import Sidebar from './views/sidebar/Sidebar'
import Chats from './views/chat/Chats'
import { useRef } from 'react'
import { usePopupStore } from './controllers/popupController'
import Popup from './shared/components/Popup'
import { useEffect } from 'react'
import ChatWindow from './views/chat/ChatWindow'

function App() {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const { targetRef, children, onClose, placement, align } = usePopupStore()
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
    <section className="App">
      
      <Chats />
      <ChatWindow />
      {targetRef && children && (
        <Popup ref={popupRef} targetRef={targetRef} placement={placement} align={align}>
          {children}
        </Popup>
      )}
    </section>
  )
}

export default App

import Sidebar from './views/sidebar/Sidebar'
import Chats from './views/chat/Chats'
import { use, useRef } from 'react'
import { usePopupStore } from './controllers/popupController'
import Popup from './shared/components/Popup'
import { useEffect } from 'react'
import UserAvatar from './views/user/userAvatar'

function App() {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const { targetRef, children, onClose } = usePopupStore()
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
    return () => {document.removeEventListener('click', handleClickOutside)}
  }, [targetRef, onClose])

  return (
    <section className="App">
      <Sidebar />
      <Chats />
      <UserAvatar name='x p' avatarURL=''/>
      {targetRef && children && (
        <Popup ref={popupRef} targetRef={targetRef}>
          {children}
        </Popup>
      )}
    </section>
  )
}

export default App

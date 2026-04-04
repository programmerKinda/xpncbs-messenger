import Sidebar from './views/sidebar/Sidebar'
import Chats from './views/chat/Chats'
import { useRef } from 'react'
import { usePopupStore } from './controllers/popupController'
import Popup from './shared/components/Popup'

function App() {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const { targetRef, children, onClose } = usePopupStore()
  return (
    <section className="App">
      <Sidebar />
      <Chats />
      {targetRef && children && (
        <Popup ref={popupRef} targetRef={targetRef}>
          {children}
        </Popup>
      )}
    </section>
  )
}

export default App

import Sidebar from './views/sidebar/Sidebar'
import Chats from './views/chat/Chats'
import Message from './views/message/Message'
import Menu from './shared/components/menu'
import Popup from './shared/components/Popup'
import Tooltip from './shared/components/Tooltip'
import {LogOut,Settings, User } from 'lucide-react'
import { useRef } from 'react'
import { usePopupStore } from './controllers/popupController'

function App() {
  const tooltipRef = useRef(React.RefObject<HTMLDivElement>)
  const { targetRef, children, onClose } = usePopupStore()
  return (
    <>
      <section className="App">
        <Sidebar />
        <Chats />
        <Tooltip targetRef={targetRef} children={children} onClose={onClose} ref={tooltipRef}/>
        {/* <Popup>
          
          <Menu items={[
            {icon: <User />, label: 'Профиль', onClick: () => console.log('Профиль') },
            {icon: <Settings />, label: 'Настройки', onClick: () => console.log('Настройки') },
            {icon: <LogOut />, label: 'Выход', onClick: () => console.log('Выход') }
          ]} />
        </Popup> */}

      </section>
    </>
  )
}
export default App

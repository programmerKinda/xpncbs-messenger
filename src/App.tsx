import Popup from './shared/components/Popup'
import Modal from './shared/components/Modal'
import { useRef, useEffect } from 'react'
import { useModalStore } from './controllers/modalController'
import { usePopupStore } from './controllers/popupController'
import MainLayout from './views/layouts/MainLayout'
import MainPage from './routes/MainPage'
import SettingsPage from './routes/SettingsPage'
import ContactsPage from './routes/ContactsPage'
import CallsPage from './routes/CallsPage'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import RegisterPage from './routes/authPages/registerPage'
import LoginPage from './routes/authPages/loginPage'

function App() {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const { targetRef, children, onClose, placement, align } = usePopupStore()
  const { modalChildren } = useModalStore()

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
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/login"
            element={
             
                <LoginPage />
              
            }
          />
          <Route element={<MainLayout />}>
          
            <Route path="/" element={<MainPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/calls" element={<CallsPage />} />
            
          </Route>
        </Routes>
      </BrowserRouter>

      {targetRef && children && (
        <Popup ref={popupRef} targetRef={targetRef} placement={placement} align={align}>
          {children}
        </Popup>
      )}
      {modalChildren && <Modal>{modalChildren}</Modal>}
    </>
  )
}

export default App

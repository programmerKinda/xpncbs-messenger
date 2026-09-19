import Popup from './shared/components/Popup'
import Modal from './shared/components/Modal'
import { useRef, useEffect } from 'react'
import { useModalStore } from './controllers/modalController'
import { usePopupStore } from './controllers/popupController'
import MainLayout from './views/layouts/MainLayout'
import MainPage from './routes/MainPage'
import ContactsPage from './routes/ContactsPage'
import CallsPage from './routes/CallsPage'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import RegisterPage from './routes/authPages/registerPage'
import LoginPage from './routes/authPages/loginPage'
import SettingLayout from './views/layouts/SettingLayout'
import SettingPageUser from './routes/settingPages/SettingPageUser'
import SettingPageSecure from './routes/settingPages/SettingPageSecure'
import { getBackendHealth, getBackendMessage } from './api/file'

function App() {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const { targetRef, children, onClose, placement, align } = usePopupStore()
  const { modalChildren } = useModalStore()

  useEffect(() => {
    void getBackendHealth().catch((error: unknown) => {
      console.error('Backend is unavailable', error)
    })

    void getBackendMessage().then((message) => {
      console.log('Backend test response:', message)
    })
  }, [])

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
          <Route path="/login" element={<LoginPage />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<MainPage />} />

            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/calls" element={<CallsPage />} />
          </Route>
          <Route element={<SettingLayout />}>
            <Route path="/settings" element={<SettingPageUser />} />
            <Route path="/settings/secure" element={<SettingPageSecure />} />
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

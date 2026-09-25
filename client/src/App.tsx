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
import Auth from './views/auth/auth'
import SettingLayout from './views/layouts/SettingLayout'
import SettingPageUser from './routes/settingPages/SettingPageUser'
import SettingPageSecure from './routes/settingPages/SettingPageSecure'
import { useAuthStore } from './controllers/authController'
import ProtectedRoute from './shared/components/ProtectedRoute'
import PublicRoute from './shared/components/PublicRoute'
import {
  SettingPageAbout,
  SettingPageAppearance,
  SettingPageChats,
  SettingPageData,
  SettingPageAccessibility,
  SettingPageAdvanced,
  SettingPageDevices,
  SettingPageHotKeys,
  SettingPageLanguage,
  SettingPageNotifications,
  SettingPageHome,
} from './routes/settingPages/SettingPageSections'
import { getBackendHealth, getBackendMessage } from './api/file'
import { useDropdownStore } from './controllers/dropdownController'
import CallOverlay from './views/calls/CallOverlay'

function App() {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const { targetRef, children, onClose, placement, align, flip, width, popupClassName } =
    usePopupStore()
  const { closeAll } = useDropdownStore()
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
        closeAll()
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [targetRef, onClose])

  const restoreSession = useAuthStore((state) => state.restoreSession)

  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    restoreSession()
    
  }, [restoreSession])

  const user = useAuthStore((state) => state.user);

console.log('CURRENT USER:', user);

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute/>}>
            <Route path="/auth" element={<Auth />} />
          </Route>
          <Route element={<ProtectedRoute/>}>
            <Route element={<MainLayout />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/chat/:chatKey" element={<MainPage />} />

            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/calls" element={<CallsPage />} />
          </Route>
          <Route element={<SettingLayout />}>
            <Route path="/settings" element={<SettingPageHome />} />
            <Route path="/settings/profile" element={<SettingPageUser />} />
            <Route path="/settings/secure" element={<SettingPageSecure />} />
            <Route path="/settings/chats" element={<SettingPageChats />} />
            <Route path="/settings/notification" element={<SettingPageNotifications />} />
            <Route path="/settings/hotKeys" element={<SettingPageHotKeys />} />
            <Route path="/settings/appearance" element={<SettingPageAppearance />} />
            <Route path="/settings/data" element={<SettingPageData />} />
            <Route path="/settings/about" element={<SettingPageAbout />} />
            <Route path="/settings/language" element={<SettingPageLanguage />} />
            <Route path="/settings/accessibility" element={<SettingPageAccessibility />} />
            <Route path="/settings/devices" element={<SettingPageDevices />} />
            <Route path="/settings/advanced" element={<SettingPageAdvanced />} />
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      {targetRef && children && (
        <Popup
          ref={popupRef}
          targetRef={targetRef}
          placement={placement}
          align={align}
          flip={flip}
          width={width}
          popupClassName={popupClassName}
        >
          {children}
        </Popup>
      )}
      {modalChildren && <Modal>{modalChildren}</Modal>}
      <CallOverlay />
    </>
  )
}

export default App

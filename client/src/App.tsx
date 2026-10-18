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
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
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

function PopupHost() {
  const popupRefs = useRef(new Map<number, HTMLDivElement>())
  const popups = usePopupStore((state) => state.popups)
  const targetRef = usePopupStore((state) => state.targetRef)
  const onClose = usePopupStore((state) => state.onClose)
  const finishClose = usePopupStore((state) => state.finishClose)
  const closeAll = useDropdownStore((state) => state.closeAll)

  const handlePopupAnimationEnd = (id: number, event: React.AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.animationName === 'popup-collapse') {
      finishClose(id)
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (targetRef && targetRef.current && targetRef.current.contains(event.target as Node)) {
        return
      }
      const clickedInsidePopup = Array.from(popupRefs.current.values()).some((popup) =>
        popup.contains(event.target as Node)
      )
      if (!clickedInsidePopup) {
        onClose()
        closeAll()
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [targetRef, onClose, closeAll])

  if (!popups.length) return null

  return (
    <>
      {popups.map((popup) => (
        <Popup
          key={popup.id}
          ref={(node: HTMLDivElement | null) => {
            if (node) popupRefs.current.set(popup.id, node)
            else popupRefs.current.delete(popup.id)
          }}
          targetRef={popup.targetRef}
          placement={popup.placement}
          align={popup.align}
          flip={popup.flip}
          width={popup.width}
          popupClassName={popup.popupClassName}
          isClosing={popup.isClosing}
          onAnimationEnd={(event: React.AnimationEvent<HTMLDivElement>) =>
            handlePopupAnimationEnd(popup.id, event)
          }
        >
          {popup.children}
        </Popup>
      ))}
    </>
  )
}

function SessionRevocationHandler() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = io(window.location.origin, { auth: { token } })
    socket.on('auth:session-revoked', () => {
      logout()
      navigate('/auth', { replace: true })
    })

    return () => {
      socket.disconnect()
    }
  }, [isAuthenticated, logout, navigate])

  return null
}

function App() {
  const { modalChildren } = useModalStore()

  useEffect(() => {
    void getBackendHealth().catch((error: unknown) => {
      console.error('Backend is unavailable', error)
    })

    void getBackendMessage().then((message) => {
      console.log('Backend test response:', message)
    })
  }, [])

  const restoreSession = useAuthStore((state) => state.restoreSession)

  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  const user = useAuthStore((state) => state.user)

  console.log('CURRENT USER:', user)

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  return (
    <>
      <BrowserRouter>
        <SessionRevocationHandler />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/auth" element={<Auth />} />
          </Route>
          <Route element={<ProtectedRoute />}>
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

      <PopupHost />
      {modalChildren && <Modal>{modalChildren}</Modal>}
      <CallOverlay />
    </>
  )
}

export default App

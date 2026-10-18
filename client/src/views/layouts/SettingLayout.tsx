import { Outlet, useLocation } from 'react-router-dom'
import SidebarSettings from '../sidebars/SidebarSettings'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
function SettingLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const updateMobileState = () => setIsMobile(mediaQuery.matches)

    updateMobileState()
    mediaQuery.addEventListener('change', updateMobileState)

    return () => mediaQuery.removeEventListener('change', updateMobileState)
  }, [])

  const showSidebar = !isMobile || location.pathname === '/settings'

  return (
    <section className={`main-layout setting-layout ${showSidebar ? '' : 'main-layout--detail'}`}>
      {showSidebar && <SidebarSettings />}
      {!showSidebar && (
        <button
          type="button"
          className="settings-mobile-back"
          onClick={() => navigate('/settings')}
          aria-label="Вернуться к разделам настроек"
        >
          <ArrowLeft size={18} />
          <span>Настройки</span>
        </button>
      )}
      <Outlet />
    </section>
  )
}

export default SettingLayout

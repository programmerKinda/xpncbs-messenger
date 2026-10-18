import { Navigate, useLocation, useOutlet } from 'react-router-dom'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/controllers/authController'
import { useChatMenuStore } from '@/controllers/chatMenuController'
import { sidebarElements } from '@/utils/sidebarElements'
import Sidebar from '@/views/sidebar/Sidebar'

const ProtectedRoute = () => {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  const matchedSectionIndex = sidebarElements.findIndex(({ path }) =>
    path === '/'
      ? pathname === '/' || pathname.startsWith('/chat/')
      : pathname === path || pathname.startsWith(`${path}/`)
  )
  const sectionIndex = matchedSectionIndex < 0 ? 0 : matchedSectionIndex
  const isChatOpen = useChatMenuStore((state) => state.isChatOpen)
  const previousSectionIndex = useRef(sectionIndex)
  const previousOutlet = useRef<ReactNode>(outlet)
  const transitionId = useRef(0)
  const [transition, setTransition] = useState<{
    id: number
    previousSectionIndex: number
    direction: 'next' | 'previous'
    outlet: ReactNode
  } | null>(null)

  useLayoutEffect(() => {
    if (sectionIndex !== previousSectionIndex.current) {
      const previousIndex = previousSectionIndex.current
      const direction = sectionIndex > previousSectionIndex.current ? 'next' : 'previous'
      previousSectionIndex.current = sectionIndex

      if (
        window.matchMedia('(max-width: 768px)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        setTransition({
          id: ++transitionId.current,
          previousSectionIndex: previousIndex,
          direction,
          outlet: previousOutlet.current,
        })
      }
    }

    previousOutlet.current = outlet
  }, [sectionIndex, outlet])

  useEffect(() => {
    if (!transition) return

    const timeout = window.setTimeout(() => {
      setTransition((current) => (current?.id === transition.id ? null : current))
    }, 650)

    return () => window.clearTimeout(timeout)
  }, [transition])

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) {
    return <div>Загрузка...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return (
    <section className={`main-layout ${isChatOpen ? 'main-layout--chat-open' : ''}`}>
      <Sidebar />
      <div className="primary-page-transition">
        {transition ? (
          <div
            className={`primary-page-transition__track primary-page-transition__track--${transition.direction}`}
          >
            {transition.direction === 'next' ? (
              <>
                <div
                  key={`section-${transition.previousSectionIndex}`}
                  className="primary-page-transition__track-page"
                >
                  {transition.outlet}
                </div>
                <div
                  key={`section-${sectionIndex}`}
                  className="primary-page-transition__track-page"
                >
                  {outlet}
                </div>
              </>
            ) : (
              <>
                <div
                  key={`section-${sectionIndex}`}
                  className="primary-page-transition__track-page"
                >
                  {outlet}
                </div>
                <div
                  key={`section-${transition.previousSectionIndex}`}
                  className="primary-page-transition__track-page"
                >
                  {transition.outlet}
                </div>
              </>
            )}
          </div>
        ) : (
          <div key={`section-${sectionIndex}`} className="primary-page-transition__page">
            {outlet}
          </div>
        )}
      </div>
    </section>
  )
}

export default ProtectedRoute

import { useRef } from 'react'
import { SearchInput } from '@/shared'

import { CommonSidebarMenuButton } from '@/shared/components/CommonSidebarMenuButton'
import { CommonSidebarResizer } from '@/shared/components/CommonSidebarResizer'
import { useChatsWidthStore } from '@/controllers/chatsWidthController'
import type { commonSidebarMenuButtonProps } from '@/models/shared/commonSidebarMenuButton'
interface CommonSidebarProps {
  title: string
  headerExtraContent?: React.ReactNode
  bodyContent?: React.ReactNode
  resize?: boolean
  popupButton?: commonSidebarMenuButtonProps
  showSearch?: boolean
  footerContent?: React.ReactNode
}
export default function CommonSidebar({
  title,
  headerExtraContent,
  bodyContent,
  resize,
  popupButton,
  showSearch = true,
  footerContent,
}: CommonSidebarProps) {
  const chatsWidth = useChatsWidthStore((state) => state.chatsWidth)
  const setChatsWidth = useChatsWidthStore((state) => state.setChatsWidth)
  const chatsRef = useRef<HTMLElement | null>(null)

  const handleResizeMove = (width: number) => {
    if (chatsRef.current) {
      chatsRef.current.style.transition = 'none'
      chatsRef.current.style.width = `${width}px`
    }
  }

  const handleResizeStart = () => {
    if (chatsRef.current) {
      chatsRef.current.style.transition = 'none'
    }
  }

  const handleResizeEnd = (width: number) => {
    if (chatsRef.current) {
      // плавный переход ширины после отпускания
      chatsRef.current.style.transition = 'width 200ms cubic-bezier(0.22, 1, 0.36, 1)'
      chatsRef.current.style.width = `${width}px`
    }
  }

  return (
    <>
      <section ref={chatsRef} className="common-sidebar" style={{ width: `${chatsWidth}px` }}>
        <header className="common-sidebar__header">
          <div className="flex items-center justify-between">
            <h1 className="logo__title">{title}</h1>
            {popupButton && <CommonSidebarMenuButton {...popupButton} />}
          </div>
          {showSearch && <SearchInput />}

          {headerExtraContent}
        </header>

        <div className="common-sidebar__body">{bodyContent}</div>
        <footer className="common-sidebar__footer">{footerContent}</footer>
        {resize && (
          <CommonSidebarResizer
            chatsWidth={chatsWidth}
            setChatsWidth={setChatsWidth}
            onResizeMove={handleResizeMove}
            onResizeStart={handleResizeStart}
            onResizeEnd={handleResizeEnd}
          />
        )}
      </section>
    </>
  )
}

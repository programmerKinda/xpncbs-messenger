import { useRef } from 'react'
import { SearchInput } from '@/shared'

import { ChatsMenuButton } from '@/views/chat/ChatsMenuButton'

import { ChatsResizer } from '@/views/chat/ChatsResizer'
import { useChatsWidthStore } from '@/controllers/chatsWidthController'
interface CommonSidebarProps {
  title: string
  headerExtraContent?: React.ReactNode
  bodyContent?: React.ReactNode
  resize?: boolean
}
export default function CommonSidebar({
  title,
  headerExtraContent,
  bodyContent,
  resize,
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
      <section ref={chatsRef} className="chats" style={{ width: `${chatsWidth}px` }}>
        <header className="chats__header">
          <div className="flex items-center justify-between">
            <h1 className="logo__title">{title}</h1>
            <ChatsMenuButton />
          </div>
          <SearchInput />

          {headerExtraContent}
        </header>

        <div className="chats__body">{bodyContent}</div>
        <footer className="chats__footer"></footer>
        {resize && (
          <ChatsResizer
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

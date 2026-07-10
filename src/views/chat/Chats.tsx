import { useRef } from 'react'
import { SearchInput } from '@/shared'
import { LogoWitchTitle } from '@/shared'
import { ChatsMenuButton } from './ChatsMenuButton'
import ChatFolders from './ChatFolders'
import { ChatsResizer } from './ChatsResizer'
import { useChatsWidthStore } from '@/controllers/chatsWidthController'

import ItemChat from './ItemChat'
export default function Chats() {
  const chatFolders = [
    { id: 1, name: 'Все' },
    { id: 2, name: 'Групповые' },
    { id: 3, name: 'Личные' },
    { id: 4, name: 'Избранные' },
  ]
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
            <LogoWitchTitle />
            <ChatsMenuButton />
          </div>
          <SearchInput />

          <ChatFolders chatFolders={chatFolders} />
        </header>
        <div className="chats__body">
          <ItemChat createdAt={new Date()} watched={true} />
        </div>
        <footer className="chats__footer"></footer>
        <ChatsResizer
          chatsWidth={chatsWidth}
          setChatsWidth={setChatsWidth}
          onResizeMove={handleResizeMove}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
        />
      </section>
    </>
  )
}

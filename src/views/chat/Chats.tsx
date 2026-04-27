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
  return (
    <>
      <section className="chats" style={{ width: `${chatsWidth}px` }}>
        <header className="chats__header">
          <div className="flex items-center justify-between">
            <LogoWitchTitle />
            <ChatsMenuButton />
          </div>
          <SearchInput />

          <ChatFolders chatFolders={chatFolders} />
        </header>
        <div className="chats__body">

          <ItemChat createdAt={new Date} watched={true}/>

        </div>
        <footer className="chats__footer"></footer>
        <ChatsResizer chatsWidth={chatsWidth} setChatsWidth={setChatsWidth} />
      </section>
    </>
  )
}

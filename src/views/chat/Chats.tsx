import { SearchInput } from '@/shared'
import { LogoWitchTitle } from '@/shared'
import { ChatsMenuButton } from './ChatsMenuButton'
import ChatFolders from './ChatFolders'
export default function Chats() {
  const chatFolders = [
    { id: 1, name: 'Все' },
    { id: 2, name: 'Групповые' },
    { id: 3, name: 'Личные' },
    { id: 4, name: 'Избранные' },
  ]
  return (
    <>
      <section className="chats">
        <header className="chats__header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <LogoWitchTitle />
            <ChatsMenuButton />
          </div>
          <SearchInput />

          <ChatFolders chatFolders={chatFolders} />
        </header>
        <div className="chats__body"></div>
        <footer className="chats__footer"></footer>
      </section>
    </>
  )
}

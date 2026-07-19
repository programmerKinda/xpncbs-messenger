import ItemChat from '@/views/chat/ItemChat'
import CommonSidebar from '@/shared/components/CommonSidebar'
import ChatFolders from '@/views/chat/ChatFolders'

export default function ChatSidebar() {
  const chatFolders = [
    { id: 1, name: 'Все' },
    { id: 2, name: 'Групповые' },
    { id: 3, name: 'Личные' },
    { id: 4, name: 'Избранные' },
  ]

  return (
    <>
      <CommonSidebar
        title="Чаты"
        headerExtraContent={<ChatFolders chatFolders={chatFolders} />}
        bodyContent={<ItemChat createdAt={new Date()} watched={true} />}
        resize={true}
      />
    </>
  )
}

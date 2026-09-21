import ItemChat from './ItemChat'
import CommonSidebar from '@/shared/components/CommonSidebar'
import ChatFolders from './ChatFolders'

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
        bodyContent={
          <>
            <ItemChat createdAt={new Date()} watched={true} name="Анна Кузнецова" message="Привет! Как проходит день?" />
            <ItemChat createdAt={new Date(Date.now() - 1000 * 60 * 42)} watched={false} name="Максим Орлов" message="Созвонимся вечером?" />
            <ItemChat createdAt={new Date(Date.now() - 1000 * 60 * 60 * 3)} watched={true} name="Ольга Смирнова" message="Файл уже отправила" />
          </>
        }
        resize={true}
      />
    </>
  )
}

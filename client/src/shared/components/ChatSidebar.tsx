import ItemChat from '@/views/chat/ItemChat'
import CommonSidebar from '@/shared/components/CommonSidebar'
import ChatFolders from '@/views/chat/ChatFolders'

import { LogOut, MoreVertical, UsersRound } from 'lucide-react'
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
        popupButton={{
          icon: <MoreVertical size={22} strokeWidth={2} />,
          menuItems: [
            {
              label: 'Создать группу',
              icon: <UsersRound size={22} strokeWidth={2} />,
              onClick: () => console.log('Новый звонок'),
            },
            {
              label: 'Выйти с аккаунта',
              icon: <LogOut size={22} strokeWidth={2} />,
              onClick: () => console.log('Новая конференция'),
            },
          ],
        }}
      />
    </>
  )
}

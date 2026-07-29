import ItemChat from '@/views/chat/ItemChat'
import CommonSidebar from '@/shared/components/CommonSidebar'
import ChatFolders from '@/views/chat/ChatFolders'

import { IoEllipsisVertical } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { LogOut } from 'lucide-react';
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
          popupButton=
                           {{
                        icon: <IoEllipsisVertical size={25}/>,
                        menuItems: [
                          {
                            label: 'Создать группу',
                            icon: <FaUserGroup size={25}/>,
                            onClick: () => console.log('Новый звонок'),
                          },
                          {
                            label: 'Выйти с аккаунта',
                            icon: <LogOut />,
                            onClick: () => console.log('Новая конференция'),
                          },
                        ],
                      }}
      />
    </>
  )
}

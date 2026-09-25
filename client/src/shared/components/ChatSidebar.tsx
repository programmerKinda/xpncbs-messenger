import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import ItemChat from '@/views/chat/ItemChat'
import CommonSidebar from '@/shared/components/CommonSidebar'
import ChatFolders from '@/views/chat/ChatFolders'
import { useChatMenuStore } from '@/controllers/chatMenuController'
import { getChatsPage } from '@/api/file'
import type { ChatListItem, ChatMessage, PaginatedResponse } from '@/models/api'
import { useAuthStore } from '@/controllers/authController'
import { useNavigate } from 'react-router-dom'

import { LogOut, MoreVertical, UsersRound } from 'lucide-react'
export default function ChatSidebar() {
  const openChat = useChatMenuStore((state) => state.openChat)
  const user = useAuthStore((state) => state.user)
  const userId = user?.id
  const navigate = useNavigate()
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const applyPage = (page: PaginatedResponse<ChatListItem>, replace = false) => {
    setChats((currentChats) =>
      replace
        ? page.items
        : [...currentChats, ...page.items.filter((item) => !currentChats.some((chat) => chat.id === item.id))],
    )
    setHasMore(page.hasMore)
    setNextCursor(page.nextCursor)
  }

  useEffect(() => {
    let isMounted = true
    const socket = io(window.location.origin, {
      auth: { token: localStorage.getItem('accessToken') },
    })

    const joinLoadedChats = (loadedChats: ChatListItem[]) => {
      if (!socket.connected) return
      loadedChats.forEach((chat) => socket.emit('chat:join', chat.id))
    }

    void getChatsPage(20)
      .then((page) => {
        if (isMounted) {
          applyPage(page, true)
          joinLoadedChats(page.items)
        }
      })
      .catch(() => {
        if (isMounted) {
          setChats([])
          setHasMore(false)
          setNextCursor(null)
        }
      })

    socket.on('connect', () => {
      getChatsPage(20)
        .then((page) => joinLoadedChats(page.items))
        .catch(() => undefined)
    })
    socket.on('message:new', (message: ChatMessage) => {
      if (!isMounted) return

      setChats((currentChats) =>
        currentChats.map((chat) =>
          chat.id === message.chatId
            ? {
                ...chat,
                lastMessageAt: message.createdAt,
                unreadCount:
                  message.senderId === userId ? chat.unreadCount : chat.unreadCount + 1,
                lastMessage: {
                  id: message.id,
                  senderId: message.senderId,
                  type: message.type,
                  content: message.content,
                  createdAt: message.createdAt,
                },
              }
            : chat,
        ),
      )
    })

    const handleMessageSent = () => {
      void getChatsPage(20)
        .then((page) => {
          if (isMounted) {
            applyPage(page, true)
            joinLoadedChats(page.items)
          }
        })
        .catch(() => undefined)
    }
    window.addEventListener('chat-message-sent', handleMessageSent)
    window.addEventListener('chat-read', handleMessageSent)

    return () => {
      isMounted = false
      socket.disconnect()
      window.removeEventListener('chat-message-sent', handleMessageSent)
      window.removeEventListener('chat-read', handleMessageSent)
    }
  }, [userId])

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
            {chats.map((chat) => (
              <ItemChat
                key={chat.id}
                id={chat.id}
                createdAt={new Date(chat.lastMessageAt ?? chat.createdAt)}
                watched={chat.lastMessage?.senderId === userId}
                name={chat.title ?? 'Без названия'}
                avatarURL={chat.avatarUrl ?? ''}
                unreadCount={chat.unreadCount}
                message={
                  typeof chat.lastMessage?.content === 'string'
                    ? chat.lastMessage.content
                    : chat.lastMessage
                      ? 'Медиафайл'
                      : chat.type === 'saved_messages'
                        ? 'Нет сохраненных сообщений'
                        : 'Нет сообщений'
                }
                onClick={() => {
                  openChat(chat)
                  const chatKey = chat.participant?.username
                    ? `@${chat.participant.username}`
                    : chat.id
                  navigate(`/chat/${chatKey}`)
                }}
              />
            ))}
            {hasMore && (
              <div style={{ padding: '12px 0', textAlign: 'center' }}>
                <button type="button" onClick={() => void getChatsPage(20, nextCursor ?? undefined).then((page) => applyPage(page, false))}>
                  Загрузить ещё
                </button>
              </div>
            )}
          </>
        }
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

import { useEffect, useRef, useState, type UIEvent } from 'react'
import { io, type Socket } from 'socket.io-client'
import ItemChat from '@/views/chat/ItemChat'
import CommonSidebar from '@/shared/components/CommonSidebar'
import ChatFolders from '@/views/chat/ChatFolders'
import { useChatMenuStore } from '@/controllers/chatMenuController'
import { getChatsPage } from '@/api/file'
import type { ChatListItem, ChatMessage, PaginatedResponse } from '@/models/api'
import { useAuthStore } from '@/controllers/authController'
import { useLocation, useNavigate } from 'react-router-dom'

import { LogOut, MoreVertical, UsersRound } from 'lucide-react'
export default function ChatSidebar() {
  const openChat = useChatMenuStore((state) => state.openChat)
  const user = useAuthStore((state) => state.user)
  const userId = user?.id
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const activeChatKey = pathname.startsWith('/chat/')
    ? decodeURIComponent(pathname.slice('/chat/'.length))
    : null
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const isLoadingMoreRef = useRef(false)
  const socketRef = useRef<Socket | null>(null)
  const loadedChatIdsRef = useRef<string[]>([])

  const joinLoadedChats = (loadedChats: ChatListItem[]) => {
    const socket = socketRef.current
    if (!socket?.connected) return
    loadedChats.forEach((chat) => socket.emit('chat:join', chat.id))
  }

  const applyPage = (page: PaginatedResponse<ChatListItem>, replace = false) => {
    loadedChatIdsRef.current = replace
      ? page.items.map((chat) => chat.id)
      : [...new Set([...loadedChatIdsRef.current, ...page.items.map((chat) => chat.id)])]
    setChats((currentChats) =>
      replace
        ? page.items
        : [
            ...currentChats,
            ...page.items.filter((item) => !currentChats.some((chat) => chat.id === item.id)),
          ]
    )
    setHasMore(page.hasMore)
    setNextCursor(page.nextCursor)
  }

  useEffect(() => {
    let isMounted = true
    const socket = io(window.location.origin, {
      auth: { token: localStorage.getItem('accessToken') },
    })
    socketRef.current = socket

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
      loadedChatIdsRef.current.forEach((chatId) => socket.emit('chat:join', chatId))
    })

    const syncChatPreview = (message: ChatMessage, isNewMessage: boolean) => {
      if (!isMounted) return

      setChats((currentChats) => {
        const updatedChats = currentChats.map((chat) => {
          if (chat.id !== message.chatId) return chat
          if (!isNewMessage && chat.lastMessage?.id !== message.id) return chat

          return {
            ...chat,
            lastMessageAt: isNewMessage ? message.createdAt : chat.lastMessageAt,
            unreadCount:
              isNewMessage && message.senderId !== userId
                ? chat.unreadCount + 1
                : chat.unreadCount,
            lastMessage: {
              id: message.id,
              senderId: message.senderId,
              type: message.type,
              content: message.content,
              createdAt: message.createdAt,
            },
          }
        })

        if (!isNewMessage) return updatedChats

        return updatedChats.sort((first, second) => {
          if (first.lastMessageAt && second.lastMessageAt) {
            return second.lastMessageAt.localeCompare(first.lastMessageAt)
          }
          if (first.lastMessageAt) return -1
          if (second.lastMessageAt) return 1
          return second.createdAt.localeCompare(first.createdAt)
        })
      })
    }

    const handleNewMessage = (message: ChatMessage) => {
      syncChatPreview(message, true)
    }
    const handleUpdatedMessage = (message: ChatMessage) => {
      syncChatPreview(message, false)
    }
    const handleChatRead = (event: Event) => {
      const chatId = (event as CustomEvent<string>).detail
      if (!chatId) return
      setChats((currentChats) =>
        currentChats.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)),
      )
    }

    socket.on('message:new', handleNewMessage)
    socket.on('message:update', handleUpdatedMessage)
    window.addEventListener('chat-read', handleChatRead)

    return () => {
      isMounted = false
      socket.disconnect()
      socketRef.current = null
      window.removeEventListener('chat-read', handleChatRead)
    }
  }, [userId])

  const handleChatsScroll = (event: UIEvent<HTMLDivElement>) => {
    const body = event.currentTarget
    if (
      !hasMore ||
      !nextCursor ||
      isLoadingMoreRef.current ||
      body.scrollHeight - body.scrollTop - body.clientHeight > 120
    ) {
      return
    }

    isLoadingMoreRef.current = true
    setIsLoadingMore(true)
    void getChatsPage(20, nextCursor)
      .then((page) => {
        applyPage(page)
        joinLoadedChats(page.items)
      })
      .catch(() => undefined)
      .finally(() => {
        isLoadingMoreRef.current = false
        setIsLoadingMore(false)
      })
  }

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
                isActive={
                  activeChatKey ===
                  (chat.participant?.username ? `@${chat.participant.username}` : chat.id)
                }
                createdAt={new Date(chat.lastMessageAt ?? chat.createdAt)}
                watched={chat.lastMessage?.senderId === userId}
                name={chat.title ?? 'Без названия'}
                avatarURL={chat.avatarUrl ?? ''}
                isSavedMessages={chat.type === 'saved_messages'}
                unreadCount={chat.unreadCount}
                message={
                  chat.lastMessage?.type === 'sticker'
                    ? 'Стикер'
                    : typeof chat.lastMessage?.content === 'string'
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
            {isLoadingMore && <div className="chat-sidebar__loading" role="status">Загрузка…</div>}
          </>
        }
        bodyOnScroll={handleChatsScroll}
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

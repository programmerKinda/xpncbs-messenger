import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import Menu from '@/shared/components/menu'

import ChatFileSendModal from './ChatFileSendModal'

import { Plus, EllipsisVertical, Phone, Video } from 'lucide-react'
import { PopupProvider } from '@/shared/components/PopupProvider'
import { User, Settings, LogOut } from 'lucide-react'
import Message from '../message/Message'
import type { Message as ChatMessageView } from '@/models/message'
import UserAvatar from '../user/UserAvatar'
import UserName from '../user/UserName'
import ContactFormModal from '../user/ContactFormModal'

import { useChatWindowController } from '@/hooks/useChatWindowController'
import { useChatMessagesController } from '@/hooks/useChatMessagesController'
import { useModalStore } from '@/controllers/modalController'
import { useChatMenuStore } from '@/controllers/chatMenuController'
import ChatForm from './ChatForm'
import CommonWindowHeader from '@/shared/components/CommonWindowHeader'
import { getChatByRouteKey, markChatRead, findOrCreateDirectChat } from '@/api/file'
import type { ChatListItem, ChatMessage } from '@/models/api'
import { useAuthStore } from '@/controllers/authController'
import { useCallStore } from '@/controllers/callController'
import { useContactStore } from '@/controllers/contactController'
import { useNavigate, useParams } from 'react-router-dom'

const getMessageDateKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

const formatMessageDate = (date: Date) => {
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'Сегодня'

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера'

  const options: Intl.DateTimeFormatOptions =
    date.getFullYear() === today.getFullYear()
      ? { day: 'numeric', month: 'long' }
      : { day: 'numeric', month: 'long', year: 'numeric' }

  return date.toLocaleDateString('ru-RU', options)
}

export default function ChatWindow() {
  const { setModalChildren, setModalHeaderContent } = useModalStore()
  const { selectedChat, setChatOpen, openChat } = useChatMenuStore()
  const selectedChatId = selectedChat?.id
  const participantId = selectedChat?.participantId
  const user = useAuthStore((state) => state.user)
  const requestCall = useCallStore((state) => state.requestCall)
  const toggleBlock = useContactStore((state) => state.toggleBlock)
  const isContact = useContactStore((state) =>
    selectedChat?.participant
      ? state.contacts.some((contact) => contact.id === selectedChat.participant?.id)
      : false
  )
  const contactEntry = useContactStore((state) =>
    selectedChat?.participant
      ? state.contacts.find((contact) => contact.id === selectedChat.participant?.id)
      : undefined
  )
  const navigate = useNavigate()
  const { chatKey: rawChatKey } = useParams<{ chatKey: string }>()
  const chatKey = rawChatKey ? decodeURIComponent(rawChatKey) : undefined
  const [autoPlayMessageId, setAutoPlayMessageId] = useState<string | null>(null)
  const [isParticipantOnline, setIsParticipantOnline] = useState(false)
  const [isParticipantTyping, setIsParticipantTyping] = useState(false)
  const [isSocketReady, setIsSocketReady] = useState(false)
  const messagesBodyRef = useRef<HTMLDivElement>(null)
  const isLoadingOlderRef = useRef(false)
  const preservedScrollRef = useRef<{ height: number; top: number } | null>(null)
  const wasAtBottomRef = useRef(true)
  const socketRef = useRef<Socket | null>(null)
  const {
    messages,
    appendMessage,
    loadOlderMessages,
    hasMore,
    sendText,
    sendVoice,
    sendCircle,
    sendSticker,
  } = useChatMessagesController(selectedChatId)
  const {
    isRecording,
    setIsRecording,
    value,
    setValue,
    formRadius,
    chatInputRef,
    formRef,
    isDragging,
    hasPhotosOrVideos,
    chatWindowRef,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragOver,
    toggleMenu,
    handleToggleRecording,
    handleEmojiSelect,
    setDraggedFiles,
  } = useChatWindowController()

  useEffect(() => {
    if (!chatKey) return

    let isCurrent = true
    const matchesRoute = selectedChat
      ? chatKey.startsWith('@')
        ? selectedChat.participant?.username === chatKey.slice(1)
        : selectedChat.id === chatKey
      : false
    if (matchesRoute) {
      return () => {
        isCurrent = false
      }
    }

    void getChatByRouteKey(chatKey).then((chat) => {
      if (isCurrent && chat) openChat(chat)
    })

    return () => {
      isCurrent = false
    }
  }, [chatKey, selectedChat, openChat])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setChatOpen(false)
      navigate('/')
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [navigate, setChatOpen])

  useEffect(() => {
    if (chatKey && selectedChat) return
    if (!chatKey) setChatOpen(false)
  }, [chatKey, selectedChat, setChatOpen])

  useEffect(() => {
    if (!selectedChat) {
      return
    }

    void markChatRead(selectedChat.id)
      .then(() =>
        window.dispatchEvent(new CustomEvent('chat-read', { detail: selectedChat.id })),
      )
      .catch(() => undefined)
  }, [selectedChat])

  useLayoutEffect(() => {
    const body = messagesBodyRef.current
    if (!body || messages.length === 0) return

    const preservedScroll = preservedScrollRef.current
    if (preservedScroll) {
      body.scrollTop = body.scrollHeight - preservedScroll.height + preservedScroll.top
      preservedScrollRef.current = null
      return
    }

    if (wasAtBottomRef.current) body.scrollTop = body.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!selectedChatId) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = io(window.location.origin, {
      auth: { token },
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('chat:join', selectedChatId)
      setIsSocketReady(true)
    })
    socket.on('message:new', (message: ChatMessage) => {
      if (message.chatId !== selectedChatId) return
      appendMessage(message)
    })
    socket.on('message:update', (message: ChatMessage) => {
      if (message.chatId !== selectedChatId) return
      appendMessage(message)
    })
    socket.on('presence:list', (onlineUserIds: string[]) => {
      setIsParticipantOnline(Boolean(participantId && onlineUserIds.includes(participantId)))
    })
    socket.on(
      'presence:update',
      ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
        if (userId === participantId) setIsParticipantOnline(status === 'online')
      }
    )
    socket.on('typing:update', (data: { chatId: string; userId: string; isTyping: boolean }) => {
      if (data.chatId === selectedChatId && data.userId === participantId) {
        setIsParticipantTyping(data.isTyping)
      }
    })
    socket.emit('presence:list')

    return () => {
      socket.disconnect()
      socketRef.current = null
      setIsSocketReady(false)
    }
  }, [participantId, selectedChatId])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !selectedChatId || !isSocketReady) return

    if (value.trim()) {
      socket.emit('typing:start', selectedChatId)
    } else {
      socket.emit('typing:stop', selectedChatId)
    }

    const timeoutId = window.setTimeout(() => socket.emit('typing:stop', selectedChatId), 1200)
    return () => window.clearTimeout(timeoutId)
  }, [isSocketReady, value, selectedChatId])

  const openFileSendModal = (files: File[]) => {
    setModalChildren(
      <>
        <ChatFileSendModal files={files} />
      </>
    )
    setModalHeaderContent(
      <div className="flex w-full justify-between">
        <span>Отправить {files.length} файлов</span>
        <button
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.multiple = true
            input.onchange = () => {
              const selectedFiles = Array.from(input.files ?? [])
              if (selectedFiles.length === 0) {
                input.remove()
                return
              }

              setDraggedFiles((prev) => {
                const nextFiles = [...prev, ...selectedFiles]
                openFileSendModal(nextFiles)
                return nextFiles
              })
              input.remove()
            }

            input.click()
          }}
        >
          <Plus />
        </button>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!selectedChat || !value.trim()) return

    await sendText(value)
    setValue('')
    chatInputRef.current?.clear()
  }

  const handleVoiceRecorded = async (blob: Blob, duration: number, waveform: number[]) => {
    if (!selectedChat) return

    await sendVoice(blob, duration, waveform)
  }

  const handleCircleRecorded = async (blob: Blob, duration: number) => {
    if (!selectedChat) return

    await sendCircle(blob, duration)
  }

  const handleStickerSelect = async (stickerId: string) => {
    if (!selectedChat) return
    await sendSticker(stickerId)
  }

  const handleMediaEnded = (messageId: string) => {
    const mediaMessages = messages.filter(
      (message) => message.type === 'voice' || message.type === 'circle'
    )
    const currentIndex = mediaMessages.findIndex((message) => message.id === messageId)
    const nextMessage = currentIndex >= 0 ? mediaMessages[currentIndex + 1] : undefined
    setAutoPlayMessageId(nextMessage?.id ?? null)
  }

  const handleMention = async (username: string) => {
    try {
      const chat = await findOrCreateDirectChat(username)
      const selectedChatData: ChatListItem = {
        ...chat,
        lastMessage: null,
      }
      openChat(selectedChatData)
      navigate(`/chat/${username.startsWith('@') ? username : `@${username}`}`)
    } catch {
      // Unknown usernames remain ordinary non-actionable message text.
    }
  }

  const visibleMessages = messages.filter((message) => message.chatId === selectedChat?.id)

  const handleMessagesScroll = () => {
    const body = messagesBodyRef.current
    if (!body) return

    wasAtBottomRef.current = body.scrollHeight - body.scrollTop - body.clientHeight <= 72
    if (body.scrollTop > 72 || !hasMore || isLoadingOlderRef.current) return

    isLoadingOlderRef.current = true
    preservedScrollRef.current = { height: body.scrollHeight, top: body.scrollTop }
    void loadOlderMessages()
      .catch(() => {
        preservedScrollRef.current = null
      })
      .finally(() => {
        isLoadingOlderRef.current = false
      })
  }

  return (
    <div
      className="chat-window"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      ref={chatWindowRef}
    >
      <CommonWindowHeader>
        <div className="flex gap-1 items-start">
          <button
            type="button"
            className="chat-window__back"
            onClick={() => {
              setChatOpen(false)
              navigate('/')
            }}
            aria-label="Вернуться к списку чатов"
            style={{ display: 'none' }}
          >
            ←
          </button>
          <UserAvatar
            id={selectedChat?.id ?? 'empty-chat'}
            name={selectedChat?.title ?? 'Чат'}
            avatarURL={selectedChat?.avatarUrl ?? ''}
            isSavedMessages={selectedChat?.type === 'saved_messages'}
          />

          <div className="chat-window__contact" onClick={toggleMenu}>
            <UserName name={selectedChat?.title ?? 'Выберите чат'} phone="" contactName="" />
            <span>
              {selectedChat?.type === 'saved_messages'
                ? 'Личные заметки'
                : isParticipantTyping
                  ? 'печатает...'
                  : isParticipantOnline
                    ? 'онлайн'
                    : 'был(а) недавно'}
            </span>
          </div>
        </div>

        <div className="chat-window__header-actions">
          {selectedChat?.participant && (
            <>
              <button
                type="button"
                aria-label="Позвонить"
                onClick={() =>
                  requestCall({
                    targetUserId: selectedChat.participant!.id,
                    peerName: selectedChat.title ?? 'Пользователь',
                    peerAvatarUrl: selectedChat.avatarUrl ?? undefined,
                    type: 'audio',
                  })
                }
              >
                <Phone size={20} />
              </button>
              <button
                type="button"
                aria-label="Видеозвонок"
                onClick={() =>
                  requestCall({
                    targetUserId: selectedChat.participant!.id,
                    peerName: selectedChat.title ?? 'Пользователь',
                    peerAvatarUrl: selectedChat.avatarUrl ?? undefined,
                    type: 'video',
                  })
                }
              >
                <Video size={20} />
              </button>
            </>
          )}
          <PopupProvider
            placement="bottom"
            align="center"
            popup={
              <Menu
                items={[
                  {
                    icon: <User />,
                    label: 'Профиль',
                    onClick: () => console.log('Профиль'),
                  },
                  {
                    icon: <Settings />,
                    label: 'Настройки',
                    onClick: () => console.log('Настройки'),
                  },
                  {
                    icon: <LogOut />,
                    label: 'Выход',
                    onClick: () => console.log('Выход'),
                  },
                ]}
              />
            }
          >
            <button type="button" aria-label="Действия чата">
              <EllipsisVertical />
            </button>
          </PopupProvider>
        </div>
      </CommonWindowHeader>
      {selectedChat &&
        selectedChat.type !== 'saved_messages' &&
        selectedChat.participant &&
        selectedChat.participant.id !== user?.id &&
        !isContact && (
          <div className="chat-window__contact-actions">
            <button
              type="button"
              className="chat-window__contact-action chat-window__contact-action--primary"
              onClick={() => {
                setModalHeaderContent(<span>Новый контакт</span>)
                setModalChildren(
                  <ContactFormModal
                    initialContact={{
                      id: selectedChat.participant!.id,
                      firstName: selectedChat.participant!.firstName,
                      lastName: selectedChat.participant!.lastName,
                      username: selectedChat.participant!.username,
                      phone: selectedChat.participant!.phone,
                      avatarUrl: selectedChat.participant!.avatarUrl,
                      about: selectedChat.participant!.about,
                    }}
                  />
                )
              }}
            >
              Добавить в контакты
            </button>
            <button
              type="button"
              className="chat-window__contact-action chat-window__contact-action--secondary"
              onClick={() => toggleBlock(selectedChat.participant!.id)}
            >
              {contactEntry?.isBlocked ? 'Разблокировать' : 'Заблокировать'}
            </button>
          </div>
        )}
      <div className="chat-window__body" ref={messagesBodyRef} onScroll={handleMessagesScroll}>
        {visibleMessages.map((message, index) => {
          const messageDate = new Date(message.createdAt)
          const previousMessageDate =
            index > 0 ? new Date(visibleMessages[index - 1].createdAt) : null
          const startsNewDay =
            !previousMessageDate ||
            getMessageDateKey(messageDate) !== getMessageDateKey(previousMessageDate)

          return (
            <Fragment key={message.id}>
              {startsNewDay && (
                <div className="chat-window__date-divider">{formatMessageDate(messageDate)}</div>
              )}
              <Message
                className={
                  selectedChat?.type !== 'saved_messages' && message.senderId === user?.id
                    ? 'message--outgoing'
                    : 'message--incoming'
                }
                message={{
                  uuid: message.id,
                  type: message.type,
                  content: message.content as ChatMessageView['content'],
                  createdAt: messageDate,
                  updated: message.edited,
                  watched: true,
                }}
                onMention={message.type === 'text' ? handleMention : undefined}
                onMediaEnded={handleMediaEnded}
                autoPlay={autoPlayMessageId === message.id}
              />
            </Fragment>
          )
        })}
      </div>
      <footer className="chat-window__footer">
        <ChatForm
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          value={value}
          setValue={setValue}
          formRadius={formRadius}
          formRef={formRef}
          chatInputRef={chatInputRef}
          handleToggleRecording={handleToggleRecording}
          handleEmojiSelect={handleEmojiSelect}
          handleStickerSelect={handleStickerSelect}
          addFileButton={true}
          voiceButton={true}
          onSend={handleSendMessage}
          onVoiceRecorded={handleVoiceRecorded}
          onCircleRecorded={handleCircleRecorded}
        />
      </footer>

      {isDragging && (
        <div
          className="chat-window__drop-area"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {hasPhotosOrVideos ? (
            <>
              <div
                className="chat-window__drop-text"
                onDrop={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  const files = [...event.dataTransfer.files]
                  handleDrop(event)
                  openFileSendModal(files)
                }}
              >
                <span className="chat-window__drop-text--primary">Перетащите фотографии сюда</span>
                <span className="chat-window__drop-text--secondary">для отправки без сжатия</span>
              </div>

              <div
                className="chat-window__drop-text"
                onDrop={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  const files = [...event.dataTransfer.files]
                  handleDrop(event)
                  openFileSendModal(files)
                }}
              >
                <span className="chat-window__drop-text--primary">Перетащите фотографии сюда</span>
                <span className="chat-window__drop-text--secondary">для быстрой отправки</span>
              </div>
            </>
          ) : (
            <div
              className="chat-window__drop-text"
              onDrop={(event) => {
                event.preventDefault()
                event.stopPropagation()
                const files = [...event.dataTransfer.files]
                handleDrop(event)
                openFileSendModal(files)
              }}
            >
              <span className="chat-window__drop-text--primary">Перетащите файл сюда</span>
              <span className="chat-window__drop-text--secondary">для отправки</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

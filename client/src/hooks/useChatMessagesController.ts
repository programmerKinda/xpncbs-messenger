import { useEffect, useState } from 'react'
import {
  getChatMessagesPage,
  sendChatMessage,
  sendCircleMessage,
  sendVoiceMessage,
} from '@/api/file'
import type { ChatMessage } from '@/models/api'

const DEFAULT_MESSAGE_PAGE_SIZE = 50

export function useChatMessagesController(chatId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  useEffect(() => {
    if (!chatId) {
      setMessages([])
      setHasMore(false)
      setNextCursor(null)
      return
    }

    let isMounted = true
    void getChatMessagesPage(chatId, DEFAULT_MESSAGE_PAGE_SIZE)
      .then((response) => {
        if (isMounted) {
          setMessages(response.items)
          setHasMore(response.hasMore)
          setNextCursor(response.nextCursor)
        }
      })
      .catch(() => {
        if (isMounted) {
          setMessages([])
          setHasMore(false)
          setNextCursor(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [chatId])

  const appendMessage = (message: ChatMessage) => {
    setMessages((currentMessages) =>
      currentMessages.some((currentMessage) => currentMessage.id === message.id)
        ? currentMessages
        : [...currentMessages, message],
    )
  }

  const loadOlderMessages = async () => {
    if (!chatId || !hasMore || !nextCursor) return

    const response = await getChatMessagesPage(chatId, DEFAULT_MESSAGE_PAGE_SIZE, nextCursor)
    setMessages((currentMessages) => [...response.items, ...currentMessages])
    setHasMore(response.hasMore)
    setNextCursor(response.nextCursor)
  }

  const sendText = async (content: string) => {
    if (!chatId || !content.trim()) return
    const message = await sendChatMessage(chatId, content.trim())
    appendMessage(message)
  }

  const sendVoice = async (blob: Blob, duration: number, waveform: number[]) => {
    if (!chatId) return
    const message = await sendVoiceMessage(chatId, blob, duration, waveform)
    appendMessage(message)
  }

  const sendCircle = async (blob: Blob, duration: number) => {
    if (!chatId) return
    const message = await sendCircleMessage(chatId, blob, duration)
    appendMessage(message)
  }

  return {
    messages,
    setMessages,
    appendMessage,
    loadOlderMessages,
    hasMore,
    nextCursor,
    sendText,
    sendVoice,
    sendCircle,
  }
}

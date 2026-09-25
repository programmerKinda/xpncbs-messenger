export type {
  BackendHealth,
  ChatListItem,
  ChatMessage,
} from '@/models/api'

import type {
  BackendHealth,
  ChatListItem,
  ChatMessage,
  PaginatedResponse,
} from '@/models/api'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export async function getBackendHealth(): Promise<BackendHealth> {
  const response = await fetch(`${API_BASE_URL}/health`)

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`)
  }

  return response.json() as Promise<BackendHealth>
}

export async function getBackendMessage(): Promise<string> {
  const response = await fetch(API_BASE_URL)

  if (!response.ok) {
    throw new Error(`Backend request failed with status ${response.status}`)
  }

  return response.text()
}

export async function getChatsPage(
  limit = 20,
  cursor?: string,
): Promise<PaginatedResponse<ChatListItem>> {
  const token = localStorage.getItem('accessToken')
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set('cursor', cursor)

  const response = await fetch(`${API_BASE_URL}/chats?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!response.ok) {
    throw new Error(`Chats request failed with status ${response.status}`)
  }

  return response.json() as Promise<PaginatedResponse<ChatListItem>>
}

export async function getChats(): Promise<ChatListItem[]> {
  const result = await getChatsPage(1000)
  return result.items
}

export async function getChatMessagesPage(
  chatId: string,
  limit = 50,
  before?: string,
): Promise<PaginatedResponse<ChatMessage>> {
  const token = localStorage.getItem('accessToken')
  const params = new URLSearchParams({ limit: String(limit) })
  if (before) params.set('before', before)

  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages?${params.toString()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!response.ok) {
    throw new Error(`Messages request failed with status ${response.status}`)
  }

  return response.json() as Promise<PaginatedResponse<ChatMessage>>
}

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  const result = await getChatMessagesPage(chatId, 500)
  return result.items
}

export async function findOrCreateDirectChat(username: string): Promise<ChatListItem> {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE_URL}/chats/direct/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!response.ok) {
    throw new Error(`Direct chat request failed with status ${response.status}`)
  }

  return response.json() as Promise<ChatListItem>
}

export async function markChatRead(chatId: string): Promise<void> {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/read`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!response.ok) {
    throw new Error(`Mark chat read failed with status ${response.status}`)
  }
}

export async function sendChatMessage(chatId: string, content: string): Promise<ChatMessage> {
  const token = localStorage.getItem('accessToken')
  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ type: 'text', content }),
  })

  if (!response.ok) {
    throw new Error(`Message send failed with status ${response.status}`)
  }

  return response.json() as Promise<ChatMessage>
}

export async function sendVoiceMessage(
  chatId: string,
  blob: Blob,
  duration: number,
  waveform: number[],
): Promise<ChatMessage> {
  const token = localStorage.getItem('accessToken')
  const formData = new FormData()
  formData.append('file', blob, 'voice.webm')
  formData.append('duration', duration.toString())
  formData.append('waveform', JSON.stringify(waveform))

  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages/voice`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Voice message send failed with status ${response.status}`)
  }

  return response.json() as Promise<ChatMessage>
}

export async function sendCircleMessage(
  chatId: string,
  blob: Blob,
  duration: number,
): Promise<ChatMessage> {
  const token = localStorage.getItem('accessToken')
  const formData = new FormData()
  formData.append('file', blob, 'circle.webm')
  formData.append('duration', duration.toString())

  const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages/circle`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Circle message send failed with status ${response.status}`)
  }

  return response.json() as Promise<ChatMessage>
}

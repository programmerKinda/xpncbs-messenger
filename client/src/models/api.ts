export interface BackendHealth {
  status: string
}

export interface PaginatedResponse<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface ChatListItem {
  id: string
  type: 'direct' | 'group' | 'channel' | 'saved_messages'
  title: string | null
  avatarUrl: string | null
  participantId?: string
  participant?: {
    id: string
    phone: string
    firstName: string
    lastName: string | null
    username: string | null
    about: string | null
    avatarUrl: string | null
  }
  unreadCount: number
  createdAt: string
  lastMessageAt: string | null
  lastMessage: {
    id: string
    senderId: string
    type: 'text' | 'voice' | 'circle' | 'file' | 'call'
    content: string | Record<string, unknown>
    createdAt: string
  } | null
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  type: 'text' | 'voice' | 'circle' | 'file' | 'call'
  content: string | Record<string, unknown>
  edited: boolean
  createdAt: string
}

export type CallDirection = 'incoming' | 'outgoing'
export type CallStatus = 'accepted' | 'missed'
export type CallType = 'phone' | 'video'

export interface CallListItem {
  id: string
  name: string
  phone: string
  time: string
  timeIso: string
  direction: CallDirection
  status: CallStatus
  type: CallType
  durationMinutes: number
}

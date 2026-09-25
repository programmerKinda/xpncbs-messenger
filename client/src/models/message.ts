export const messageTypes = ['text', 'voice', 'circle', 'file', 'call'] as const

export type MessageType = (typeof messageTypes)[number]
export type MessageVoiceContent = {
  id: string
  duration: number
  waveform: number[]
  content: string
}
export type MessageCircleContent = {
  id: string
  duration: number
  content: string
  watched: boolean
}
export type MessageCallContent = {
  callId: string
  direction: 'incoming' | 'outgoing'
  type: 'audio' | 'video'
  status: 'accepted' | 'missed'
  durationSeconds: number
}
export type MessageContentType = string | MessageVoiceContent | MessageCircleContent | MessageCallContent

export type Message = {
  uuid: string
  type: MessageType
  content: MessageContentType
  createdAt: Date
  updated: boolean
  watched: boolean
}
export interface MessageProps {
  message: Message
  className?: string
  onMention?: (username: string) => void
  onMediaEnded?: (messageId: string) => void
  autoPlay?: boolean
}

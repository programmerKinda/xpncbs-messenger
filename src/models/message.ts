export const messageTypes = ['text', 'voice', 'circle', 'file'] as const

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
export type MessageContentType = string | MessageVoiceContent | MessageCircleContent

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
}

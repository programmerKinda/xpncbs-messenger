export const messageTypes = ['text', 'voice'] as const

export type MessageType = (typeof messageTypes)[number]
export type MessageVoiceContent = {
  id: string
  duration: number
  waveform: number[]
  content: string
}
export type MessageContentType = string | MessageVoiceContent

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

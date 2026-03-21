export const messageTypes = ['text', 'voice'] as const

export type MessageType = (typeof messageTypes)[number]

export type Message = {
  uuid: string
  type: MessageType
  content: string
  createdAt: Date
  updated: boolean
  watched: boolean
}
export interface MessageProps {
  message: Message
}

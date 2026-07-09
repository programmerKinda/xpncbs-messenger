export interface ChatsResizerProps {
  chatsWidth: number
  setChatsWidth: (width: number) => void
}
export interface ChatResizingParams {
  setStartWidth: (width: number) => void
  startWidth: number
}
export interface ChatsWidth extends ChatsResizerProps, ChatResizingParams {}

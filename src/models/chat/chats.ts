export interface ChatsResizerProps {
  chatsWidth: number
  setChatsWidth: (width: number, persist?: boolean) => void
  onResizeMove?: (width: number) => void
  onResizeStart?: (width: number) => void
  onResizeEnd?: (width: number) => void
}
export interface ChatResizingParams {
  setStartWidth: (width: number) => void
  startWidth: number
}
export interface ChatsWidth extends ChatsResizerProps, ChatResizingParams {}

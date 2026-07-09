import { type ChatsWidth, type ChatsResizerProps } from '@/models/chat/chats'
import { create } from 'zustand'

const STORAGE_KEY = 'chatsWidth'
export const useChatsWidthStore = create<ChatsWidth>((set) => ({
  startWidth: 0,
  setStartWidth: (width) => set({ startWidth: width }),
  chatsWidth: Number(localStorage.getItem(STORAGE_KEY)) || 360,
  setChatsWidth: (width) => {
    localStorage.setItem(STORAGE_KEY, width.toString()) // сохраняем
    set({ chatsWidth: width })
  },
}))

export const startResizing = (
  e: React.MouseEvent<HTMLDivElement>, //мин 86пх
  { chatsWidth, setChatsWidth }: ChatsResizerProps
) => {
  e.preventDefault()
  const { setStartWidth } = useChatsWidthStore.getState()
  const startX = e.clientX
  const startWidth = chatsWidth
  setStartWidth(startWidth)

  const onMouseMove = (e: MouseEvent) => {
    const newWidth = startWidth + (e.clientX - startX)
    if (newWidth >= 86 && newWidth <= 600) setChatsWidth(newWidth)
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
export const endResizing = (
  e: React.MouseEvent<HTMLDivElement>, //мин 86пх
  { chatsWidth, setChatsWidth }: ChatsResizerProps
) => {
  e.preventDefault()
  const { startWidth } = useChatsWidthStore.getState()
  if (chatsWidth < 150 && startWidth > chatsWidth) {
    setChatsWidth(86)
  } else if (chatsWidth > 86 && startWidth < chatsWidth) {
    setChatsWidth(150)
  }
}

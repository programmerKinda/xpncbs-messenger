import { type ChatsWidth, type ChatsResizerProps } from '@/models/chat/chats'
import { create } from 'zustand'

const STORAGE_KEY = 'chatsWidth'
const MIN_WIDTH = 86
const MAX_WIDTH = 600

export const useChatsWidthStore = create<ChatsWidth>((set) => ({
  startWidth: 0,
  setStartWidth: (width) => set({ startWidth: width }),
  chatsWidth: Number(localStorage.getItem(STORAGE_KEY)) || 360,
  setChatsWidth: (width) => {
    localStorage.setItem(STORAGE_KEY, width.toString())
    set({ chatsWidth: width })
  },
}))

export const startResizing = (
  e: React.MouseEvent<HTMLDivElement>,
  { chatsWidth, setChatsWidth }: ChatsResizerProps
) => {
  e.preventDefault()

  const startX = e.clientX
  const startWidth = chatsWidth
  const { setStartWidth } = useChatsWidthStore.getState()

  setStartWidth(startWidth)

  const stopResizing = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', stopResizing)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const onMouseMove = (event: MouseEvent) => {
    const nextWidth = startWidth + (event.clientX - startX)
    const clampedWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, nextWidth))
    setChatsWidth(clampedWidth)
  }

  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopResizing)
}

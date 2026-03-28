import { type ChatsWidth } from '@/models/chat/chats'
import { create } from 'zustand'

const STORAGE_KEY = 'chatsWidth'
export const useChatsWidthStore = create<ChatsWidth>((set) => ({
  chatsWidth: Number(localStorage.getItem(STORAGE_KEY)) || 360,
  setChatsWidth: (width) => {
    localStorage.setItem(STORAGE_KEY, width.toString()) // сохраняем
    set({ chatsWidth: width })
  },
}))

export const startResizing = (
  e: React.MouseEvent<HTMLDivElement>,
  { chatsWidth, setChatsWidth }: ChatsWidth
) => {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = chatsWidth

  const onMouseMove = (e: MouseEvent) => {
    const newWidth = startWidth + (e.clientX - startX)
    if (newWidth >= 200 && newWidth <= 600) setChatsWidth(newWidth)
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

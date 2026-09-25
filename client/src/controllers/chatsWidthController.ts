import { type ChatsWidth, type ChatsResizerProps } from '@/models/chat/chats'
import { create } from 'zustand'

const STORAGE_KEY = 'chatsWidth'
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
  { chatsWidth, setChatsWidth, onResizeMove, onResizeStart, onResizeEnd }: ChatsResizerProps
) => {
  e.preventDefault()

  const steps = [80, 240]

  const startX = e.clientX
  const startWidth = chatsWidth
  const { setStartWidth } = useChatsWidthStore.getState()
  setStartWidth(startWidth)

  const clampDuringDrag = (w: number) => {
    if (w < steps[0]) return steps[0]
    return Math.min(MAX_WIDTH, Math.max(steps[0], w))
  }

  const onMouseMove = (event: MouseEvent) => {
    const nextWidth = startWidth + (event.clientX - startX)
    const clampedWidth = clampDuringDrag(nextWidth)
    setChatsWidth(clampedWidth)
    onResizeMove?.(clampedWidth)
  }

  const stopResizing = (event?: MouseEvent) => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', stopResizing)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''

    const finalWidth = event
      ? startWidth + (event.clientX - startX)
      : useChatsWidthStore.getState().chatsWidth

    let nearest: number
    if (finalWidth > steps[1]) {
      // If user dragged beyond second step, preserve chosen width (clamped to MAX_WIDTH)
      nearest = Math.min(MAX_WIDTH, Math.max(steps[1], finalWidth))
    } else {
      const candidates = [...steps]
      nearest = candidates.reduce((a, b) =>
        Math.abs(b - finalWidth) < Math.abs(a - finalWidth) ? b : a
      )
    }

    setChatsWidth(nearest)
    onResizeEnd?.(nearest)
  }

  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  onResizeStart?.(startWidth)
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopResizing)
}

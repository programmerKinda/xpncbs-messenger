import { create } from 'zustand'
import { type Message } from '@/models/message'

interface MediaStore {
  activeId: string | null
  messages: Message[] // Храним список всех сообщений чата
  setMessages: (messages: Message[]) => void
  playAudio: (id: string) => void
  stopAudio: (id: string) => void
  playNext: (currentId: string) => void
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  activeId: null,
  messages: [],

  setMessages: (messages) => set({ messages }),

  playAudio: (id) => set({ activeId: id }),

  stopAudio: (id) => set((state) => (state.activeId === id ? { activeId: null } : state)),

  playNext: (currentId) => {
    const { messages } = get()

    // Находим индекс текущего сообщения
    const currentIndex = messages.findIndex(
      (m) => m.uuid === currentId || (typeof m.content !== 'string' && m.content.id === currentId)
    )

    if (currentIndex === -1) return

    // Ищем следующее голосовое сообщение после текущего
    const nextVoiceMessage = messages.slice(currentIndex + 1).find((m) => m.type === 'voice')

    if (nextVoiceMessage && typeof nextVoiceMessage.content !== 'string') {
      set({ activeId: nextVoiceMessage.content.id })
    } else {
      set({ activeId: null }) // Больше голосовых нет
    }
  },
}))

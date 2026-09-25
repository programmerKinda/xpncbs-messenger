import { create } from 'zustand'
import type { ChatListItem } from '@/models/api'

type ChatMenuState = {
  isOpen: boolean
  isChatOpen: boolean
  selectedChat: ChatListItem | null
  toggleMenu: () => void
  setChatOpen: (value: boolean) => void
  openChat: (chat: ChatListItem) => void
}

export const useChatMenuStore = create<ChatMenuState>((set) => ({
  isOpen: false,
  isChatOpen: false,
  selectedChat: null,
  toggleMenu: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),
  setChatOpen: (value) =>
    set(() => ({
      isChatOpen: value,
      ...(value ? {} : { selectedChat: null, isOpen: false }),
    })),
  openChat: (chat) =>
    set(() => ({
      selectedChat: chat,
      isChatOpen: true,
    })),
}))

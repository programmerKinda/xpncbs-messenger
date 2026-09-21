import { create } from 'zustand'

type ChatMenuState = {
  isOpen: boolean
  isChatOpen: boolean
  toggleMenu: () => void
  setChatOpen: (value: boolean) => void
}

export const useChatMenuStore = create<ChatMenuState>((set) => ({
  isOpen: false,
  isChatOpen: false,
  toggleMenu: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),
  setChatOpen: (value) =>
    set(() => ({
      isChatOpen: value,
    })),
}))

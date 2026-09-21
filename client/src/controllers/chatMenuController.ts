import { create } from 'zustand'

type ChatMenuState = {
  isOpen: boolean
  toggleMenu: () => void
}

export const useChatMenuStore = create<ChatMenuState>((set) => ({
  isOpen: false,
  toggleMenu: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),
}))

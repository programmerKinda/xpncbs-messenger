import { create } from 'zustand'

interface ModalState {
  modalChildren: React.ReactNode | null
  setModalChildren: (children: React.ReactNode | null) => void
  resetModalChildren: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  modalChildren: null,
  setModalChildren: (children) => set({ modalChildren: children }),
  resetModalChildren: () => set({ modalChildren: null }),
}))

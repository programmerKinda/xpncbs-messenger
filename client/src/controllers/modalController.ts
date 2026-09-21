import { create } from 'zustand'

interface ModalState {
  modalChildren: React.ReactNode | null
  modalHeaderContent: React.ReactNode | null
  setModalChildren: (children: React.ReactNode | null) => void
  setModalHeaderContent: (headerContent: React.ReactNode | null) => void
  resetModalChildren: () => void
  resetModalHeaderContent: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  modalChildren: null,
  modalHeaderContent: null,
  setModalHeaderContent: (headerContent) => set({ modalHeaderContent: headerContent }),
  resetModalHeaderContent: () => set({ modalHeaderContent: null }),
  setModalChildren: (children) => set({ modalChildren: children }),
  resetModalChildren: () => set({ modalChildren: null }),
}))

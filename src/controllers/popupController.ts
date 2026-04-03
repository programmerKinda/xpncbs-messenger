import { create } from 'zustand'

interface TooltipStore {
  targetRef: React.RefObject<HTMLElement> | null
  children: React.ReactNode

  setTargetRef: (ref: React.RefObject<HTMLElement>) => void
  setChildren: (children: React.ReactNode) => void
  onClose: () => void
}

export const usePopupStore = create<TooltipStore>((set) => ({
  targetRef: null,
  children: null,

  setTargetRef: (ref) => set({ targetRef: ref }),
  setChildren: (children) => set({ children }),

  onClose: () => set({ children: null }),
}))
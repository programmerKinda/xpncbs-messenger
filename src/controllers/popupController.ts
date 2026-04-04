import { create } from 'zustand'
import React from 'react'

interface TooltipStore {
  parent: HTMLElement | null
  targetRef: React.RefObject<HTMLElement> | null
  children: React.ReactNode

  setTargetRef: (ref: React.RefObject<HTMLElement>) => void
  setChildren: (children: React.ReactNode) => void
  onClose: () => void
}

export const usePopupStore = create<TooltipStore>((set) => ({
  parent: null,
  targetRef: null,
  children: null,

  setTargetRef: (ref) => {
    set({ targetRef: ref })
    const parent = ref.current?.parentElement || null
    set({ parent })
  },

  setChildren: (children) => set({ children }),

  onClose: () => {
    set({ targetRef: null, children: null, parent: null })
  },
}))

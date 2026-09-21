import { create } from 'zustand'
import React from 'react'
import { type Placement, type Align } from '../models/tooltip'

interface TooltipStore {
  parent: HTMLElement | null
  targetRef: React.RefObject<HTMLElement> | null
  children: React.ReactNode | null

  placement: Placement
  align: Align
  flip: boolean

  setPopup: (data: {
    ref: React.RefObject<HTMLElement>
    children: React.ReactNode
    placement?: Placement
    align?: Align
    flip?: boolean
  }) => void
  updatePopup: (children: React.ReactNode) => void

  onClose: () => void
}

export const usePopupStore = create<TooltipStore>((set) => ({
  parent: null,
  targetRef: null,
  children: null,

  placement: 'bottom',
  align: 'start',
  flip: true,

  setPopup: ({ ref, children, placement = 'bottom', align = 'start', flip = true }) => {
    set({
      targetRef: ref,
      children,
      placement,
      align,
      flip,
      parent: ref.current?.parentElement || null,
    })
  },

  updatePopup: (children) => set({ children }),

  onClose: () => {
    set({
      targetRef: null,
      children: null,
      parent: null,
      placement: 'bottom',
      align: 'start',
      flip: true,
    })
  },
}))

import { create } from 'zustand'
import React from 'react'
import { type Placement, type Align } from '../models/tooltip'

interface TooltipStore {
  parent: HTMLElement | null
  targetRef: React.RefObject<HTMLElement> | null
  children: React.ReactNode | null

  placement: Placement
  align: Align

  setPopup: (data: {
    ref: React.RefObject<HTMLElement>
    children: React.ReactNode
    placement?: Placement
    align?: Align
  }) => void

  onClose: () => void
}

export const usePopupStore = create<TooltipStore>((set) => ({
  parent: null,
  targetRef: null,
  children: null,

  placement: 'bottom',
  align: 'start',

  setPopup: ({ ref, children, placement = 'bottom', align = 'start' }) => {
    set({
      targetRef: ref,
      children,
      placement,
      align,
      parent: ref.current?.parentElement || null,
    })
  },

  onClose: () => {
    set({
      targetRef: null,
      children: null,
      parent: null,
      placement: 'bottom',
      align: 'start',
    })
  },
}))

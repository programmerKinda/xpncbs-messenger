import { create } from 'zustand'
import React from 'react'
import { type Placement, type Align } from '../models/tooltip'

interface PopupData {
  ref: React.RefObject<HTMLElement>
  children: React.ReactNode
  placement?: Placement
  align?: Align
  flip?: boolean
  width?: string
  popupClassName?: string
}

export interface PopupInstance {
  id: number
  targetRef: React.RefObject<HTMLElement>
  children: React.ReactNode
  placement: Placement
  align: Align
  flip: boolean
  width: string
  popupClassName?: string
  isClosing: boolean
}

interface TooltipStore {
  parent: HTMLElement | null
  popups: PopupInstance[]
  activePopupId: number | null
  targetRef: React.RefObject<HTMLElement> | null
  children: React.ReactNode | null
  onClose: () => void
  setPopup: (data: PopupData) => void
  updatePopup: (children: React.ReactNode) => void
  finishClose: (id: number) => void
}

export const usePopupStore = create<TooltipStore>((set, get) => {
  let nextPopupId = 0

  return {
    parent: null,
    popups: [],
    activePopupId: null,
    targetRef: null,
    children: null,

    setPopup: (data) => {
      const state = get()
      const activePopupId = state.activePopupId
      const id = ++nextPopupId
      const popup: PopupInstance = {
        id,
        targetRef: data.ref,
        children: data.children,
        placement: data.placement ?? 'bottom',
        align: data.align ?? 'start',
        flip: data.flip ?? true,
        width: data.width ?? 'max-content',
        popupClassName: data.popupClassName,
        isClosing: false,
      }

      set((current) => ({
        parent: document.body,
        popups: [
          ...current.popups.map((item) =>
            item.id === activePopupId ? { ...item, isClosing: true } : item
          ),
          popup,
        ],
        activePopupId: id,
        targetRef: data.ref,
        children: data.children,
      }))
    },

    updatePopup: (children) => {
      const activePopupId = get().activePopupId
      if (activePopupId === null) return

      set((state) => ({
        children,
        popups: state.popups.map((popup) =>
          popup.id === activePopupId ? { ...popup, children } : popup
        ),
      }))
    },

    onClose: () => {
      const activePopupId = get().activePopupId
      if (activePopupId === null) return

      set((state) => ({
        activePopupId: null,
        targetRef: null,
        children: null,
        popups: state.popups.map((popup) =>
          popup.id === activePopupId ? { ...popup, isClosing: true } : popup
        ),
      }))
    },

    finishClose: (id) => {
      set((state) => {
        const popups = state.popups.filter((popup) => popup.id !== id)
        return {
          popups,
          parent: popups.length ? state.parent : null,
        }
      })
    },
  }
})
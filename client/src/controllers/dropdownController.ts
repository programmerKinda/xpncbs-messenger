import { create } from 'zustand'

type DropdownState = {
  values: Record<string, string>
  isOpen: Record<string, boolean>

  setValue: (id: string, value?: string) => void
  setIsOpen: (id: string, value: boolean) => void
  closeAll: () => void
}

export const useDropdownStore = create<DropdownState>((set) => ({
  values: {},
  isOpen: {},

  setValue: (id, value) =>
    set((state) => ({
      values: {
        ...state.values,
        [id]: value || 'Не выбрано',
      },
    })),

  setIsOpen: (id, value) =>
    set((state) => ({
      isOpen: {
        ...state.isOpen,
        [id]: value,
      },
    })),

  closeAll: () =>
    set({
      isOpen: {},
    }),
}))

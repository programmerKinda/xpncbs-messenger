import { type User } from '../models/user/user'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  restoreSession: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  isLoading: true,

  isAuthenticated: false,

  restoreSession: async () => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })

      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        localStorage.removeItem('accessToken')

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })

        return
      }

      const user: User = await response.json()

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      localStorage.removeItem('accessToken')

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken')

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },
}))

import { type UpdateProfileData, type User } from '../models/user/user'
import { create } from 'zustand'

export type { UpdateProfileData } from '../models/user/user'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  restoreSession: () => Promise<void>
  setSession: (accessToken: string) => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<User>
  uploadAvatar: (file: File) => Promise<User>
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

  setSession: async (accessToken) => {
    localStorage.setItem('accessToken', accessToken)
    await useAuthStore.getState().restoreSession()
  },

  updateProfile: async (data) => {
    const token = localStorage.getItem('accessToken')
    const response = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Profile update failed with status ${response.status}`)
    }

    const user: User = await response.json()
    set({ user })
    return user
  },

  uploadAvatar: async (file) => {
    const token = localStorage.getItem('accessToken')
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/auth/profile/avatar', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Avatar upload failed with status ${response.status}`)
    }

    const user: User = await response.json()
    set({ user })
    return user
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

import { createContext, useContext, useEffect, useState } from 'react'
import { type User } from 'firebase/auth'
import { subscribeToAuthState } from '@/services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToAuthState((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

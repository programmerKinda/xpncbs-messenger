import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/views/auth/authContext'
import type React from 'react'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div>Загрузка...</div>
  }

  if (!user) {
    // Разрешаем неавторизованным пользователям доступ к страницам входа и регистрации
    if (location.pathname === '/login' || location.pathname === '/register') {
      return children
    }
    return <Navigate to="/login" replace />
  }

  // Если пользователь авторизован — не показываем страницы входа/регистрации
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

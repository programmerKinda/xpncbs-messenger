import { useNavigate } from 'react-router-dom'
import { signInWithGoogle } from '@/services/authService'

export function useGoogleLoginController() {
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle()
      console.log('User info:', result.user)
      navigate('/')
    } catch (error) {
      console.error('Ошибка Google входа:', error)
    }
  }

  return { handleGoogleLogin }
}

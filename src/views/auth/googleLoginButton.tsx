import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from '../../api/firebase'
import { signInWithPopup } from 'firebase/auth'
import { FaChrome } from 'react-icons/fa'

export default function GoogleLoginButton() {
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      console.log('User info:', user)
      navigate('/')
    } catch (error) {
      console.error('Ошибка Google входа:', error)
    }
  }
  return (
    <button
      type="button"
      className="oauth__button oauth__button--google"
      onClick={handleGoogleLogin}
      aria-label="Вход через Google"
    >
      <FaChrome size={20} />
      <span>Google</span>
    </button>
  )
}

import { useGoogleLoginController } from '@/controllers/auth/useGoogleLoginController'
import { FaChrome } from 'react-icons/fa'

export default function GoogleLoginButton() {
  const { handleGoogleLogin } = useGoogleLoginController()
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

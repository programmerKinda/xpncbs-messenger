import { Mail, Phone } from 'lucide-react'
import OAuth from './oauth'

interface OAuthProps {
  onEmailClick?: () => void
  onPhoneClick?: () => void
}

export default function Auth({ onEmailClick, onPhoneClick }: OAuthProps) {
  return (
    <div className="oauth">
      <p className="oauth__divider">Способы авторизации</p>
      <div className="oauth__methods">
        <button
          type="button"
          className="oauth__button oauth__button--email"
          onClick={onEmailClick}
          aria-label="Вход по email"
        >
          <Mail size={20} />
          <span>Email</span>
        </button>

        <button
          type="button"
          className="oauth__button oauth__button--phone"
          onClick={onPhoneClick}
          aria-label="Вход по номеру телефона"
        >
          <Phone size={20} />
          <span>Телефон</span>
        </button>

        <OAuth />
      </div>
    </div>
  )
}

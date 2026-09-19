import PasswordInput from '@/views/auth/passwordInput.tsx'
import GoogleLoginButton from '@/views/auth/googleLoginButton.tsx'
import { useLoginController } from '@/controllers/auth/useLoginController'

export default function LoginPage() {
  const { emailForm, handleRegisterClick, onEmailSubmit } = useLoginController()

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Войти в аккаунт</h1>

        <form className="auth-form" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
          {/* Email или телефон */}
          <label className="auth-form__label">
            Email
            <input
              type="email"
              className="auth-form__input"
              placeholder="example@mail.ru"
              {...emailForm.register('email')}
            />
            {emailForm.formState.errors.email && (
              <p className="auth-form__error">{emailForm.formState.errors.email.message}</p>
            )}
          </label>

          {/* Пароль */}
          <PasswordInput
            label="Пароль"
            placeholder="Введите пароль"
            register={emailForm.register('password')}
            error={emailForm.formState.errors.password?.message}
          />

          <button type="submit" className="auth-form__button">
            Войти
          </button>

          <GoogleLoginButton />
        </form>

        <div className="auth-footer">
          <p>Нету аккаунта?</p>
          <button onClick={handleRegisterClick} className="auth-footer__link">
            Зарегестрироваться
          </button>
        </div>
      </div>
    </div>
  )
}

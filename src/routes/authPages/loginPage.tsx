import { useNavigate } from 'react-router-dom'
import PasswordInput from '@/views/auth/passwordInput.tsx'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { emailLoginSchema } from '@/validation/loginWithEmailSchema.ts'
import GoogleLoginButton from '@/views/auth/googleLoginButton.tsx'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/api/firebase.ts'

// Типы для TS
type EmailForm = z.infer<typeof emailLoginSchema>

export default function LoginPage() {
  const navigate = useNavigate()

  const handleRegisterClick = () => navigate('/register')

  // useForm для email и phone
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailLoginSchema),
    mode: 'onBlur',
  })

  const onEmailSubmit = async (data: EmailForm) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      console.log('Успешный вход')
      navigate('/')
    } catch (error) {
      emailForm.setError('password', {
        type: 'server',
        message: 'Ошибка входа. Проверьте email и пароль',
      })
      console.error('Ошибка входа:', error)
    }
  }

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

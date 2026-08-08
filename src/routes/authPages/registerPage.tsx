import { useNavigate } from 'react-router-dom'

import PasswordInput from '../../views/auth/passwordInput.jsx'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { emailRegisterSchema } from '@/validation/registerWithEmailSchema.ts'
import GoogleLoginButton from '@/views/auth/googleLoginButton.tsx'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/api/firebase.ts'

// Типы для TS
type EmailForm = z.infer<typeof emailRegisterSchema>

export default function RegisterPage() {
  const navigate = useNavigate()

  const handleLoginClick = () => navigate('/login')

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailRegisterSchema),
    mode: 'onBlur',
  })

  const onEmailSubmit = async (data: EmailForm) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      await setDoc(doc(db, 'users', user.uid), {
        name: data.name,
        createdAt: new Date(),
      })
      console.log('REGISTER DATA:', user)
      navigate('/')
    } catch (error) {
      console.error('Ошибка регистрации:', error)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Создать аккаунт</h1>

        <form className="auth-form" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
          {/* Email */}
          <label className="auth-form__label">
            Имя
            <input
              type="text"
              className="auth-form__input"
              placeholder="Введите имя"
              {...emailForm.register('name')}
            />
            {emailForm.formState.errors.name && (
              <p className="auth-form__error">{emailForm.formState.errors.name.message}</p>
            )}
          </label>
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

          <PasswordInput
            label="Подтвердите пароль"
            placeholder="Повторите пароль"
            register={emailForm.register('confirmPassword')}
            error={emailForm.formState.errors.confirmPassword?.message}
          />

          <button type="submit" className="auth-form__button">
            Зарегистрироваться
          </button>

          <GoogleLoginButton />
        </form>

        <div className="auth-footer">
          <p>Уже есть аккаунт?</p>
          <button onClick={handleLoginClick} className="auth-footer__link">
            Войти
          </button>
        </div>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { emailLoginSchema } from '@/validation/loginWithEmailSchema'
import { signInWithEmail } from '@/services/authService'

type EmailForm = z.infer<typeof emailLoginSchema>

export function useLoginController() {
  const navigate = useNavigate()
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailLoginSchema),
    mode: 'onBlur',
  })

  const handleRegisterClick = () => navigate('/register')

  const onEmailSubmit = async (data: EmailForm) => {
    try {
      await signInWithEmail(data.email, data.password)
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

  return { emailForm, handleRegisterClick, onEmailSubmit }
}

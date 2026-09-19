import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { emailRegisterSchema } from '@/validation/registerWithEmailSchema'
import { registerWithEmail } from '@/services/authService'

type EmailForm = z.infer<typeof emailRegisterSchema>

export function useRegisterController() {
  const navigate = useNavigate()
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailRegisterSchema),
    mode: 'onBlur',
  })

  const handleLoginClick = () => navigate('/login')

  const onEmailSubmit = async (data: EmailForm) => {
    try {
      const user = await registerWithEmail(data.name, data.email, data.password)
      console.log('REGISTER DATA:', user)
      navigate('/')
    } catch (error) {
      console.error('Ошибка регистрации:', error)
    }
  }

  return { emailForm, handleLoginClick, onEmailSubmit }
}

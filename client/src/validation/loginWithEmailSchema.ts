import { z } from 'zod'
export const emailLoginSchema = z.object({
  email: z.string().min(1, 'Email обязателен').email('Некорректный email'),

  password: z.string().min(1, 'Пароль обязателен'),
})

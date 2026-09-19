import { z } from 'zod'
import { passwordSchema } from './passwordSchema'

export const emailRegisterSchema = z
  .object({
    name: z.string().min(1, 'Имя обязательно').max(50, 'Имя слишком длинное'),
    email: z
      .string()
      .min(1, 'Email обязателен')
      .max(254, 'Email слишком длинный')
      .email('Некорректный email'),

    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Пароли не совпадают',
  })

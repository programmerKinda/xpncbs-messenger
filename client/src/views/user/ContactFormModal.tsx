import { useForm } from 'react-hook-form'
import { useId } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ContactEntry } from '@/models/contact'
import { useModalStore } from '@/controllers/modalController'
import { useContactActions } from '@/hooks/useContactsController'

interface ContactFormModalProps {
  initialContact?: Partial<ContactEntry> & { id?: string }
}

const contactSchema = z
  .object({
    firstName: z.string().trim(),
    lastName: z.string().trim(),
    username: z.string().trim(),
    phone: z.string().trim(),
    customName: z.string().trim(),
    about: z.string().trim(),
  })
  .refine((data) => data.firstName || data.phone || data.username, {
    message: 'Укажите имя, номер телефона или логин',
    path: ['firstName'],
  })

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactFormModal({ initialContact }: ContactFormModalProps) {
  const { addContact } = useContactActions()
  const resetModalChildren = useModalStore((state) => state.resetModalChildren)
  const resetModalHeaderContent = useModalStore((state) => state.resetModalHeaderContent)
  const generatedContactId = useId()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: initialContact?.firstName ?? '',
      lastName: initialContact?.lastName ?? '',
      username: initialContact?.username ?? '',
      phone: initialContact?.phone ?? '',
      customName: initialContact?.customName ?? '',
      about: initialContact?.about ?? '',
    },
  })

  const close = () => {
    resetModalChildren()
    resetModalHeaderContent()
  }

  const onSubmit = (values: ContactFormValues) => {
    addContact({
      id: initialContact?.id ?? `local-contact-${generatedContactId}`,
      firstName: values.firstName || 'Контакт',
      lastName: values.lastName || null,
      username: values.username.replace(/^@/, '') || null,
      phone: values.phone,
      avatarUrl: initialContact?.avatarUrl ?? null,
      about: values.about || null,
      customName: values.customName || null,
      isBlocked: initialContact?.isBlocked ?? false,
      addedAt: initialContact?.addedAt ?? new Date().toISOString(),
    })
    close()
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit(onSubmit)}>
      <p className="contact-form__description">
        Заполните данные контакта. Личная подпись будет видна только вам.
      </p>
      <div className="contact-form__grid">
        <label className="contact-form__field">
          <span>Имя</span>
          <input {...register('firstName')} aria-invalid={Boolean(errors.firstName)} autoFocus />
          {errors.firstName && <small className="contact-form__field-error">{errors.firstName.message}</small>}
        </label>
        <label className="contact-form__field">
          <span>Фамилия</span>
          <input {...register('lastName')} />
        </label>
      </div>
      <label className="contact-form__field">
        <span>Телефон</span>
        <input {...register('phone')} placeholder="+7 900 000-00-00" type="tel" />
      </label>
      <label className="contact-form__field">
        <span>Логин</span>
        <input {...register('username')} placeholder="username" />
      </label>
      <label className="contact-form__field">
        <span>Ваша подпись</span>
        <input {...register('customName')} placeholder="Например, Маша с работы" />
      </label>
      <label className="contact-form__field">
        <span>О себе <em>(необязательно)</em></span>
        <textarea {...register('about')} placeholder="Коротко о контакте" rows={3} />
      </label>
      <div className="contact-form__actions">
        <button type="button" className="contact-form__cancel" onClick={close}>
          Отмена
        </button>
        <button type="submit" className="contact-form__submit">
          Сохранить контакт
        </button>
      </div>
    </form>
  )
}

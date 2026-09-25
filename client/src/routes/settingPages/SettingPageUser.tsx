import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Check, MoreHorizontal } from 'lucide-react'

import { useAuthStore } from '@/controllers/authController'
import type { UpdateProfileData } from '@/models/user/user'
import UserAvatar from '@/views/user/UserAvatar'
import AvatarCropper from '@/views/user/AvatarCropper'
import { useModalStore } from '@/controllers/modalController'

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'Введите имя'),
  lastName: z.string().trim(),
  username: z.string().trim(),
  about: z.string().trim(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function SettingPageUser() {
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const uploadAvatar = useAuthStore((state) => state.uploadAvatar)
  const setModalChildren = useModalStore((state) => state.setModalChildren)
  const setModalHeaderContent = useModalStore((state) => state.setModalHeaderContent)
  const resetModalChildren = useModalStore((state) => state.resetModalChildren)
  const resetModalHeaderContent = useModalStore((state) => state.resetModalHeaderContent)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '', username: '', about: '' },
  })
  const form = watch()

  useEffect(() => {
    if (!user) return

    reset({
      firstName: user.firstName,
      lastName: user.lastName ?? '',
      username: user.username ?? '',
      about: user.about ?? '',
    })
  }, [reset, user])

  if (!user) return null

  const handleSubmitProfile = async (values: ProfileFormValues) => {
    setSaveMessage('')
    setIsSaving(true)

    try {
      await updateProfile(values as UpdateProfileData)
      setSaveMessage('Изменения сохранены')
    } catch {
      setSaveMessage('Не удалось сохранить изменения')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !file.type.startsWith('image/')) return

    setModalHeaderContent(<span>Настроить аватар</span>)
    setModalChildren(
      <AvatarCropper
        file={file}
        onCancel={() => {
          resetModalChildren()
          resetModalHeaderContent()
        }}
        onSave={async (croppedFile) => {
          try {
            await uploadAvatar(new File([croppedFile], 'avatar.jpg', { type: 'image/jpeg' }))
            setSaveMessage('Аватар обновлен')
            resetModalChildren()
            resetModalHeaderContent()
          } catch {
            setSaveMessage('Не удалось загрузить аватар')
          }
        }}
      />,
    )
  }

  return (
    <div className="setting-page">
      <form className="setting-page-user__form" onSubmit={handleSubmit(handleSubmitProfile)}>
        <div className="setting-profile">
          <header className="setting-profile__hero">
            <div className="setting-profile__hero-glow" />
            <div className="setting-profile__identity">
              <div className="setting-profile__avatar-wrap">
                <UserAvatar
                  id={user.id}
                  name={`${form.firstName} ${form.lastName}`}
                  avatarURL={user.avatarUrl ?? ''}
                  size={96}
                />
                <button
                  type="button"
                  className="setting-profile__avatar-action"
                  aria-label="Изменить фото"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera size={16} strokeWidth={2.2} />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="setting-profile__eyebrow">Личный профиль</p>
                <h1>
                  {form.firstName} {form.lastName}
                </h1>
                <p className="setting-profile__email">{user.phone}</p>
              </div>
            </div>
          </header>

          <section className="setting-profile__body">
            <div className="setting-section-heading">
              <div>
                <p className="setting-section-heading__eyebrow">Профиль</p>
                <h2>Личные данные</h2>
              </div>
              <span className="setting-section-heading__status">
                <Check size={15} /> {saveMessage || 'Синхронизировано'}
              </span>
            </div>

            <div className="setting-page-user__fields">
              <label className="setting-field">
                <span>Имя</span>
                <input
                  type="text"
                  className="setting-page-user__field"
                  placeholder="Имя"
                  maxLength={59}
                  aria-invalid={Boolean(errors.firstName)}
                  {...register('firstName')}
                />
                {errors.firstName && <small className="setting-field__error">{errors.firstName.message}</small>}
              </label>
              <label className="setting-field">
                <span>Фамилия</span>
                <input
                  type="text"
                  className="setting-page-user__field"
                  placeholder="Фамилия"
                  maxLength={59}
                  {...register('lastName')}
                />
              </label>
              <label className="setting-field">
                <span>Никнейм</span>
                <input
                  type="text"
                  className="setting-page-user__field"
                  placeholder="Никнейм"
                  maxLength={59}
                  {...register('username')}
                />
              </label>
              <label className="setting-field setting-field--wide">
                <span>О себе</span>
                <textarea
                  className="setting-page-user__field resize-none"
                  placeholder="Расскажите о себе"
                  rows={4}
                  maxLength={300}
                  {...register('about')}
                />
              </label>
            </div>

            <footer className="setting-page-user__actions">
              <button
                type="submit"
                className="setting-page-user__button setting-page-user__button--primary"
                disabled={isSaving}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
              <button
                type="button"
                className="setting-page-user__button setting-page-user__button--icon"
                aria-label="Дополнительные действия"
              >
                <MoreHorizontal size={22} strokeWidth={2} />
              </button>
            </footer>
          </section>

          <button type="button" className="setting-profile__logout">
            Выйти из аккаунта
          </button>
        </div>
      </form>
    </div>
  )
}
import PhoneInput from '../inputs/phoneInput/phoneInput'
import countries from '../inputs/phoneInput/utils/countries'
import { getCountry } from '../inputs/phoneInput/utils/phoneMaskSet'
import FlagModule from 'react-world-flags'
import { MessageSquareText } from 'lucide-react'
import { type ChangeEvent, useEffect, useMemo, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropdownStore } from '@/controllers/dropdownController'
import DropdownWithArrow from '@/shared/components/dropdown/DropdownWithArrow'
import { useAuthStore } from '@/controllers/authController'
import { createAuthProfile, sendAuthCode, verifyAuthCode } from '@/services/authApi'
import { useNavigate } from 'react-router-dom'

const Flag = FlagModule.default

const phoneSchema = z.object({ phone: z.string().trim().min(1, 'Введите номер телефона') })
const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/, 'Введите 6-значный код') })
const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'Введите имя'),
  lastName: z.string().trim(),
  about: z.string().trim(),
})

type PhoneFormValues = z.infer<typeof phoneSchema>
type CodeFormValues = z.infer<typeof codeSchema>
type ProfileFormValues = z.infer<typeof profileSchema>

export default function Auth() {
  const navigate = useNavigate()

  const { setValue: setDropdownValue } = useDropdownStore()
  const setSession = useAuthStore((state) => state.setSession)

  const [inputValue, setInputValue] = useState('')
  const [isPhoneFormSubmited, setIsPhoneFormSubmited] = useState(false)
  const [isProfileFormSubmited, setIsProfileFormSubmited] = useState(false)
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  })
  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  })
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '', about: '' },
  })
  const code = codeForm.watch('code')
  const profileValues = profileForm.watch()

  const divRef = useRef<HTMLDivElement | null>(null)
  const [width, setWidth] = useState('')

  const countriesItems = useMemo(
    () =>
      Object.values(countries)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((country) => (
          <div
            key={country.iso}
            className="flex items-center"
            onClick={() => setInputValue(country.code)}
          >
            <Flag
              code={country.iso}
              width={25}
              height={25}
            />

            <span className="country-name flex-auto px-2">
              {country.name}
            </span>

            <span>+{country.code}</span>
          </div>
        )),
    [],
  )

  const handleInput = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value

    setInputValue(value)

    const country = getCountry(value)

    setDropdownValue(
      'countries',
      country?.name ?? 'Не выбрано',
    )
    phoneForm.setValue('phone', value, { shouldValidate: true })
  }

  useEffect(() => {
    const div = divRef.current

    if (div) {
      setWidth(`${div.offsetWidth}px`)
    }
  }, [])

  // ---------------------------------
  // Отправка номера телефона
  // ---------------------------------

  const handlePhoneSubmit = async ({ phone }: PhoneFormValues) => {
    try {
      const response = await sendAuthCode(phone)

      if (response.success) {
        setIsPhoneFormSubmited(true)
      }
    } catch (error) {
      console.error(
        'Ошибка отправки телефона:',
        error,
      )
    }
  }

  // ---------------------------------
  // Проверка SMS-кода
  // ---------------------------------

  const handleCodeSubmit = async ({ code: submittedCode }: CodeFormValues) => {
    try {
      const response = await verifyAuthCode(inputValue, submittedCode)

      if (!response.success) {
        return
      }

      // ---------------------------------
      // Существующий пользователь
      // ---------------------------------

      if (response.exists && response.accessToken) {
        await setSession(response.accessToken)

        navigate('/')

        return
      }

      // ---------------------------------
      // Новый пользователь
      // ---------------------------------

      setIsProfileFormSubmited(true)
    } catch (error) {
      console.error(
        'Ошибка проверки кода:',
        error,
      )
    }
  }

  // ---------------------------------
  // Создание профиля
  // ---------------------------------

  const handleProfileSubmit = async ({ firstName, lastName, about }: ProfileFormValues) => {
    try {
      const response = await createAuthProfile({ phone: inputValue, firstName, lastName, about })

      if (!response.success || !response.accessToken) {
        return
      }

      await setSession(response.accessToken)

      navigate('/')
    } catch (error) {
      console.error(
        'Ошибка создания профиля:',
        error,
      )
    }
  }

  return (
    <div className="auth-page">

      {/* ================================= */}
      {/* 1. НОМЕР ТЕЛЕФОНА */}
      {/* ================================= */}

      {!isPhoneFormSubmited && (
        <form
          className="auth-card"
          onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
        >
          <div
            className="auth-brand"
            aria-hidden="true"
          >
            <MessageSquareText
              size={56}
              strokeWidth={2}
            />
          </div>

          <p className="auth-kicker">
            XPNCBS Messenger
          </p>

          <h1 className="auth-title">
            Войдите в аккаунт
          </h1>

          <p className="auth-subtitle">
            Проверьте код страны и введите
            <br />
            номер телефона для входа.
          </p>

          <div
            className="auth-field auth-country-field"
            ref={divRef}
          >
            <span className="auth-field__label">
              Страна
            </span>

            <DropdownWithArrow
              id="countries"
              items={countriesItems}
              valueSelector=".country-name"
              search={true}
              width={width}
            />
          </div>

          <label className="auth-field auth-phone-field">
            <span className="auth-field__label">
              Номер телефона
            </span>

            <PhoneInput
              value={inputValue}
              onChange={handleInput}
              placeholder=""
              className={phoneForm.formState.errors.phone ? 'auth-input--error' : undefined}
              aria-invalid={Boolean(phoneForm.formState.errors.phone)}
            />
          </label>
          {phoneForm.formState.errors.phone && (
            <p className="auth-form-error">{phoneForm.formState.errors.phone.message}</p>
          )}

          <button
            className="auth-next-button"
            type="submit"
          >
            Продолжить
          </button>
        </form>
      )}

      {/* ================================= */}
      {/* 2. SMS-КОД */}
      {/* ================================= */}

      {isPhoneFormSubmited &&
        !isProfileFormSubmited && (
          <form
            className="auth-card"
            onSubmit={codeForm.handleSubmit(handleCodeSubmit)}
          >
            <div
              className="auth-brand"
              aria-hidden="true"
            >
              <MessageSquareText
                size={56}
                strokeWidth={2}
              />
            </div>

            <p className="auth-kicker">
              Проверка номера
            </p>

            <h1 className="auth-title">
              Введите код
            </h1>

            <p className="auth-subtitle">
              Мы отправили код подтверждения
              <br />
              на номер{' '}
              <strong>{inputValue}</strong>
            </p>

            <div className="auth-code">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                className={`auth-code__input${codeForm.formState.errors.code ? ' auth-input--error' : ''}`}
                aria-invalid={Boolean(codeForm.formState.errors.code)}
                onChange={(event) => {
                  codeForm.setValue('code', event.target.value.replace(/\D/g, '').slice(0, 6), {
                    shouldValidate: true,
                  })
                }}
                autoFocus
                aria-label="Код подтверждения"
              />

              <div
                className="auth-code__boxes"
                aria-hidden="true"
              >
                {Array.from({ length: 6 }).map(
                  (_, index) => {
                    const isFilled =
                      Boolean(code[index])

                    const isActive =
                      code.length === index

                    return (
                      <div
                        key={index}
                        className={[
                          'auth-code__box',
                          isFilled &&
                            'auth-code__box--filled',
                          isActive &&
                            'auth-code__box--active',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {code[index] ?? ''}
                      </div>
                    )
                  },
                )}
              </div>
            </div>

            <p className="auth-verification__hint">
              Введите 6-значный код из SMS
            </p>
            {codeForm.formState.errors.code && (
              <p className="auth-form-error">{codeForm.formState.errors.code.message}</p>
            )}

            <button
              className="auth-next-button"
              type="submit"
              disabled={code.length !== 6}
            >
              Подтвердить
            </button>

            <button
              className="auth-verification__back"
              type="button"
              onClick={() => {
                setIsPhoneFormSubmited(false)
                codeForm.reset()
              }}
            >
              Изменить номер
            </button>
          </form>
        )}

      {/* ================================= */}
      {/* 3. ПРОФИЛЬ */}
      {/* ================================= */}

      {isProfileFormSubmited && (
        <form
          className="auth-card"
          onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
        >
          <div
            className="auth-brand"
            aria-hidden="true"
          >
            <MessageSquareText
              size={56}
              strokeWidth={2}
            />
          </div>

          <p className="auth-kicker">
            Ваш профиль
          </p>

          <h1 className="auth-title">
            Расскажите о себе
          </h1>

          <p className="auth-subtitle">
            Введите имя и фамилию
            <br />
            для создания профиля.
          </p>

          <label className="auth-field auth-profile-field">
            <span className="auth-field__label">
              Имя
            </span>

            <input
              type="text"
              {...profileForm.register('firstName')}
              placeholder="Введите имя"
              autoComplete="given-name"
              autoFocus
              aria-invalid={Boolean(profileForm.formState.errors.firstName)}
            />
            {profileForm.formState.errors.firstName && (
              <p className="auth-form-error">{profileForm.formState.errors.firstName.message}</p>
            )}
          </label>

          <label className="auth-field auth-profile-field">
            <span className="auth-field__label">
              Фамилия
            </span>

            <input
              type="text"
              {...profileForm.register('lastName')}
              placeholder="Введите фамилию"
              autoComplete="family-name"
            />
          </label>

          <label className="auth-field auth-profile-field auth-profile-field--about">
            <span className="auth-field__label">
              О себе
            </span>

            <textarea
              {...profileForm.register('about')}
              placeholder="Расскажите немного о себе"
              maxLength={120}
              rows={3}
            />
          </label>

          <button
            className="auth-next-button"
            type="submit"
            disabled={!profileValues.firstName.trim()}
          >
            Продолжить
          </button>
        </form>
      )}
    </div>
  )
}
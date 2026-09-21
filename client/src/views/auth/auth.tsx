import PhoneInput from '../inputs/phoneInput/phoneInput'
import countries from '../inputs/phoneInput/utils/countries'
import { getCountry } from '../inputs/phoneInput/utils/phoneMaskSet'
import FlagModule from 'react-world-flags'
import { MessageSquareText } from 'lucide-react'
import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useDropdownStore } from '@/controllers/dropdownController'
import { useRef } from 'react'
import DropdownWithArrow from '@/shared/components/dropdown/DropdownWithArrow'
import axios from 'axios'

const Flag = FlagModule.default

export default function Auth() {
  const [inputValue, setInputValue] = useState('')
  const [code, setCode] = useState('')
  const [isPhoneFormSubmited, setIsPhoneFormSubmited] = useState(false)

  const { setValue } = useDropdownStore()

  const countriesItems = useMemo(
    () =>
      Object.values(countries)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((country) => (
          <div className="flex items-center" onClick={() => setInputValue(country.code)}>
            <Flag code={country.iso} width={25} height={25} />

            <span className="country-name flex-auto px-2">{country.name}</span>

            <span>+{country.code}</span>
          </div>
        )),
    []
  )

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    setInputValue(value)

    const country = getCountry(value)

    setValue('countries', country?.name ?? 'Не выбрано')
  }

  const divRef = useRef<HTMLDivElement | null>(null)

  const [width, setWidth] = useState('')

  useEffect(() => {
    const div = divRef.current

    if (div) {
      const widthValue = div.offsetWidth

      setWidth(`${widthValue}px`)
    }
  }, [])

  const handlePhoneSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const response = await axios.post('http://localhost:3000/api/auth/send-code', {
        phone: inputValue,
      })

      console.log(response.data)

      if (response.data.success) {
        setIsPhoneFormSubmited(true)
      }
    } catch (error) {
      console.error('Ошибка отправки телефона:', error)
    }
  }

  const handleCodeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const response = await axios.post('http://localhost:3000/api/auth/verify-code', {
        phone: inputValue,
        code,
      })

      console.log(response.data)

      if (response.data.success) {
        console.log('Телефон подтверждён')
      }
    } catch (error) {
      console.error('Ошибка проверки кода:', error)
    }
  }

  return (
    <div className="auth-page">
      {!isPhoneFormSubmited && (
        <form className="auth-card" onSubmit={handlePhoneSubmit}>
          <div className="auth-brand" aria-hidden="true">
            <MessageSquareText size={56} strokeWidth={2} />
          </div>

          <p className="auth-kicker">XPNCBS Messenger</p>

          <h1 className="auth-title">Войдите в аккаунт</h1>

          <p className="auth-subtitle">
            Проверьте код страны и введите
            <br />
            номер телефона для входа.
          </p>

          <div className="auth-field auth-country-field" ref={divRef}>
            <span className="auth-field__label">Страна</span>

            <DropdownWithArrow
              id="countries"
              items={countriesItems}
              valueSelector=".country-name"
              search={true}
              width={width}
            />
          </div>

          <label className="auth-field auth-phone-field">
            <span className="auth-field__label">Номер телефона</span>

            <PhoneInput value={inputValue} onChange={handleInput} placeholder="" />
          </label>

          <button className="auth-next-button" type="submit">
            Продолжить
          </button>
        </form>
      )}

      {isPhoneFormSubmited && (
  <form className="auth-card" onSubmit={handleCodeSubmit}>
    <div className="auth-brand" aria-hidden="true">
      <MessageSquareText size={56} strokeWidth={2} />
    </div>

    <p className="auth-kicker">Проверка номера</p>

    <h1 className="auth-title">
      Введите код
    </h1>

    <p className="auth-subtitle">
      Мы отправили код подтверждения
      <br />
      на номер <strong>{inputValue}</strong>
    </p>

    <div className="auth-code">
      <input
        className="auth-code__input"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(event) => {
          setCode(
            event.target.value
              .replace(/\D/g, '')
              .slice(0, 6)
          )
        }}
        autoFocus
        aria-label="Код подтверждения"
      />

      <div className="auth-code__boxes" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => {
          const isFilled = Boolean(code[index])
          const isActive = code.length === index

          return (
            <div
              key={index}
              className={[
                'auth-code__box',
                isFilled && 'auth-code__box--filled',
                isActive && 'auth-code__box--active',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {code[index] ?? ''}
            </div>
          )
        })}
      </div>
    </div>

    <p className="auth-verification__hint">
      Введите 6-значный код из SMS
    </p>

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
        setCode('')
      }}
    >
      Изменить номер
    </button>
  </form>
)}
    </div>
  )
}

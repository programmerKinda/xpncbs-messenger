import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'

interface PasswordInputProps {
  label: string
  placeholder: string
  error?: string
  // props для RHF
  register?: UseFormRegisterReturn
}

export default function PasswordInput({
  label,
  placeholder,
  error,
  register,
}: PasswordInputProps) {
  const [hasFocus, setHasFocus] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  return (
    <label className="auth-form__label">
      {label}
      <div className={`auth-form__div ${hasFocus ? 'focus' : ''}`}>
        <input
        className=""
          type={isPasswordVisible ? 'text' : 'password'}
          placeholder={placeholder}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          {...register} // вот тут подключаем RHF
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="auth-form__eye-btn"
        >
          {isPasswordVisible ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {error && <p className="auth-form__error">{error}</p>}
    </label>
  )
}

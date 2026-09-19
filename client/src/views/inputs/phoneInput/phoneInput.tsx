import { type InputHTMLAttributes, useState, type ChangeEvent, useEffect } from 'react'
import { phoneMaskSet } from './utils/phoneMaskSet'

interface PhoneInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  onChange,
  value,
  type = 'tel',
  className,
  ...props
}) => {
  const [phone, setPhone] = useState<string>('')

  useEffect(() => {
    if (value !== undefined) {
      setPhone(phoneMaskSet(String(value)))
    }
  }, [value])

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const masked = phoneMaskSet(e.target.value)
    setPhone(masked)

    onChange?.({
      ...e,
      target: { ...e.target, value: masked },
    } as ChangeEvent<HTMLInputElement>)
  }

  return <input {...props} type={type} value={phone} onChange={handleInput} className={className} />
}

export default PhoneInput

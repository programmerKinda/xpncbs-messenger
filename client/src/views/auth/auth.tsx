import PhoneInput from '../inputs/phoneInput/phoneInput'
import countries from '../inputs/phoneInput/utils/countries'
import { getCountry } from '../inputs/phoneInput/utils/phoneMaskSet'
import FlagModule from 'react-world-flags'
import { Send } from 'lucide-react'
import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useDropdownStore } from '@/controllers/dropdownController'
import { useRef } from 'react'
import DropdownWithArrow from '@/shared/components/dropdown/DropdownWithArrow'

const Flag = FlagModule.default

export default function Auth() {
  const [inputValue, setInputValue] = useState('')
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
    const country = getCountry(event.target.value)
    setValue('countries', country?.name ?? 'Не выбрано')
  }
  const divRef = useRef<HTMLDivElement | null>(null)
  const [width,setWidth] = useState("")
  useEffect(()=>{
    const div = divRef.current
    if(div){
      const width = div.offsetWidth
      setWidth(`${width}px`)
    }
  },[])
  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={(event) => event.preventDefault()}>
        <div className="auth-brand" aria-hidden="true">
          <Send size={58} strokeWidth={2.2} />
        </div>
        <h1 className="auth-title">Войти в Telegram</h1>
        <p className="auth-subtitle">
          Проверьте код страны и
          <br />
          введите свой номер телефона.
        </p>

        <div className="auth-field auth-country-field" ref={divRef}>
          <span className="auth-field__label">Страна</span>
          <DropdownWithArrow
          className='mt-2'
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
          ДАЛЕЕ
        </button>
      </form>
    </div>
  )
}

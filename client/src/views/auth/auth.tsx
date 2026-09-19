import PhoneInput from '../inputs/phoneInput/phoneInput'
import Dropdown from '@/shared/components/dropdown/Dropdown'
import countries from '../inputs/phoneInput/utils/countries'
import FlagModule from 'react-world-flags'

const Flag = FlagModule.default

export default function Auth() {
  const countriesItems = Object.values(countries)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((country) => (
    <div className="flex items-center">
      <Flag code={country.iso} width={25} height={25} />
      <span className="country-name flex-auto px-2">{country.name}</span>
      <span>+{country.code}</span>
    </div>
  ))
  return (
    <div className="auth-page">
      <form action="">
        <Dropdown items={countriesItems} valueSelector=".country-name" />
        <PhoneInput />
      </form>
    </div>
  )
}

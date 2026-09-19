import { countryCodes } from './countryCodes'
export const plus_one_mask = (value: string, setCountryCode: (code: string) => void) => {
  if (value.length <= 1) {
    value = `+${value}`
    setCountryCode('us')
  } else if (value.length <= 4) {
    const areaCode = value.slice(1, 4) as string
    const countryCode = countryCodes[areaCode]
    if (countryCode != undefined) {
      setCountryCode(countryCode)
    } else {
      setCountryCode('us')
    }
    value = `+${value.slice(0, 1)} (${value.slice(1)}`
  } else if (value.length <= 7) {
    value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4)}`
  } else if (value.length <= 9) {
    value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7)}`
  } else {
    value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 11)}`
  }
  return value
}

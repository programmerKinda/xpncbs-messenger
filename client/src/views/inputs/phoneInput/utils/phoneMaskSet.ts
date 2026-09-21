import { countryCodes } from './specificCodes'
import countries from './countries'

export const getCountry = (value: string) => {
  const formattedValue = value.replace(/\D/g, '')
  let country = Object.values(countries).find((country) => formattedValue.startsWith(country.code))

  if (!country) {
    return undefined
  }

  if (formattedValue.startsWith('1')) {
    const countryCode = countryCodes[formattedValue.slice(1, 4)]

    if (!countryCode) {
      return undefined
    }

    country = countries[countryCode]
  } else if (formattedValue.startsWith('7') && formattedValue[1] === '7') {
    country = countries.kz
  }

  return country
}

export const phoneMaskSet = (value: string, setCountryCode?: (code: string) => void): string => {
  const formattedValue = value.replace(/\D/g, '')
  let formattedPhone = ''
  const country = getCountry(value)

  if (country) {
    setCountryCode?.(country.iso)

    const mask = country.format
    let digitIndex = 0

    for (const maskCharacter of mask) {
      if (maskCharacter === 'X') {
        if (digitIndex >= formattedValue.length) {
          break
        }

        formattedPhone += formattedValue[digitIndex]
        digitIndex += 1
      } else if (digitIndex < formattedValue.length) {
        formattedPhone += maskCharacter
      }
    }

    return formattedPhone
  } else {
    value = value.replace(/\D/g, '')

    if (value.length > 0) {
      value = `+${value}`
    }

    value = value.slice(0, 16)

    setCountryCode?.('not-chosen')
    return value
  }
}

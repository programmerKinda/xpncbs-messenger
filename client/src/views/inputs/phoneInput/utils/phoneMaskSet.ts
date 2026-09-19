import { countryCodes } from './specificCodes'
import countries from './countries'

export const phoneMaskSet = (value: string, setCountryCode?: (code: string) => void): string => {
  let formattedValue = value.replace(/\D/g, '')
  let formattedPhone = ''
  let country = Object.values(countries).find((country) => formattedValue.startsWith(country.code))

  // Обработка специфичных кейсов
  if (country) {
    // США/Канада
    if (formattedValue.startsWith('1')) {
      for (const key of Object.keys(countryCodes)) {
        if (formattedValue.slice(1, 4) === key) {
          let countryCode = countryCodes[key]
          country = countries[countryCode]
        }
      }
    }

    // Казахстан
    else if (formattedValue.startsWith('7') && formattedValue[1] === '7') {
      country = countries.kz
    }

    setCountryCode?.(country.iso)

    const mask = country.format
    const valueArray = formattedValue.split('')

    for (let i = 0; i <= valueArray.length - 1; i++) {
      if (valueArray.length <= mask.length) {
        if (mask[i] !== 'X') {
          valueArray.splice(i, 0, mask[i])
        }
        formattedPhone = valueArray.join('')
      } else {
        formattedPhone = `${valueArray.join('').slice(0, mask.length)}`
        break
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

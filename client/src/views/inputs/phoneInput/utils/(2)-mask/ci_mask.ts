export const ci_mask = (value: string, setCountryCode: (code: string) => void) => {
  setCountryCode('ci')
  if (value.replace(/\D/g, '').length <= 3) {
    value = value.replace(/\D/g, '')
    value = `+${value}`
  } else if (value.replace(/\D/g, '').length <= 5) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3)}`
  } else if (value.replace(/\D/g, '').length <= 6) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 5)}-${value.slice(5)}`
  } else if (value.replace(/\D/g, '').length <= 7) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 5)}-${value.slice(5, 7)}`
  } else if (value.replace(/\D/g, '').length <= 8) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 5)}-${value.slice(5, 7)}-${value.slice(7)}`
  } else if (value.replace(/\D/g, '').length <= 9) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 5)}-${value.slice(5, 7)}-${value.slice(7, 9)}`
  } else if (value.replace(/\D/g, '').length <= 10) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 5)}-${value.slice(5, 7)}-${value.slice(7, 9)}-${value.slice(9)}`
  } else {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 5)}-${value.slice(5, 7)}-${value.slice(7, 9)}-${value.slice(9, 11)}`
  }

  return value
}

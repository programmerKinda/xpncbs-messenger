export const be_mask = (value: string, setCountryCode: (code: string) => void) => {
  setCountryCode('be')
  if (value.replace(/\D/g, '').length <= 2) {
    value = value.replace(/\D/g, '')
    value = `+${value}`
  } else if (value.replace(/\D/g, '').length <= 3) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2)}`
  } else if (value.replace(/\D/g, '').length <= 4) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 4)}`
  } else if (value.replace(/\D/g, '').length <= 5) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 5)}`
  } else if (value.replace(/\D/g, '').length <= 6) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5)}`
  } else if (value.replace(/\D/g, '').length <= 7) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 7)}`
  } else if (value.replace(/\D/g, '').length <= 8) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 7)} ${value.slice(7)}`
  } else if (value.replace(/\D/g, '').length <= 9) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 7)} ${value.slice(7, 9)}`
  } else if (value.replace(/\D/g, '').length <= 10) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 7)} ${value.slice(7, 9)} ${value.slice(9)}`
  } else {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 7)} ${value.slice(7, 9)} ${value.slice(9, 11)}`
  }

  return value
}

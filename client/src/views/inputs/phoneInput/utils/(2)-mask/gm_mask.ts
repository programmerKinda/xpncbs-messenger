export const gm_mask = (value: string, setCountryCode: (code: string) => void) => {
  setCountryCode('gm')
  if (value.replace(/\D/g, '').length <= 3) {
    value = value.replace(/\D/g, '')
    value = `+${value}`
  } else if (value.replace(/\D/g, '').length <= 6) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3)}`
  } else if (value.replace(/\D/g, '').length <= 7) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 6)}-${value.slice(6)}`
  } else {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 6)}-${value.slice(6, 10)}`
  }

  return value
}

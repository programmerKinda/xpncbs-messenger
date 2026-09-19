export const ao_mask = (value: string, setCountryCode: (code: string) => void) => {
  setCountryCode('ao')
  if (value.replace(/\D/g, '').length <= 3) {
    value = value.replace(/\D/g, '')
    value = `+${value}`
  } else if (value.replace(/\D/g, '').length <= 6) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3)}`
  } else if (value.replace(/\D/g, '').length <= 7) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 6)}) ${value.slice(6)}`
  } else if (value.replace(/\D/g, '').length <= 8) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 6)}) ${value.slice(6, 8)}`
  } else if (value.replace(/\D/g, '').length <= 9) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 6)}) ${value.slice(6, 9)}`
  } else if (value.replace(/\D/g, '').length <= 10) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 6)}) ${value.slice(6, 9)} ${value.slice(9)}`
  } else {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 6)}) ${value.slice(6, 9)} ${value.slice(9, 12)}`
  }
  return value
}

export const km_mask = (value: string, setCountryCode: (code: string) => void) => {
  setCountryCode('km')
  if (value.replace(/\D/g, '').length <= 3) {
    value = value.replace(/\D/g, '')
    value = `+${value}`
  } else if (value.replace(/\D/g, '').length <= 5) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3)}`
  } else if (value.replace(/\D/g, '').length <= 6) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 5)}) ${value.slice(5)}`
  } else if (value.replace(/\D/g, '').length <= 7) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 5)}) ${value.slice(5, 7)}`
  } else if (value.replace(/\D/g, '').length <= 8) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 5)}) ${value.slice(5, 8)}`
  } else if (value.replace(/\D/g, '').length <= 9) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 5)}) ${value.slice(5, 8)} ${value.slice(8)}`
  } else if (value.replace(/\D/g, '').length <= 10) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 5)}) ${value.slice(5, 8)} ${value.slice(8, 10)}`
  } else {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} (${value.slice(3, 5)}) ${value.slice(5, 8)} ${value.slice(8, 11)}`
  }

  return value
}

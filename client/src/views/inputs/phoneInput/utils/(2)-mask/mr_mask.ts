export const mr_mask = (value: string, setCountryCode: (code: string) => void) => {
  setCountryCode('mr')
  if (value.replace(/\D/g, '').length <= 3) {
    value = value.replace(/\D/g, '')
    value = `+${value}`
  } else if (value.replace(/\D/g, '').length <= 4) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3)}`
  } else if (value.replace(/\D/g, '').length <= 5) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 5)}`
  } else if (value.replace(/\D/g, '').length <= 6) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 6)}`
  } else if (value.replace(/\D/g, '').length <= 7) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`
  } else if (value.replace(/\D/g, '').length <= 8) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 8)}`
  } else if (value.replace(/\D/g, '').length <= 9) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 8)} ${value.slice(8)}`
  } else if (value.replace(/\D/g, '').length <= 10) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 8)} ${value.slice(8, 10)}`
  } else if (value.replace(/\D/g, '').length <= 11) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 8)} ${value.slice(8, 10)} ${value.slice(10)}`
  } else {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 8)} ${value.slice(8, 10)} ${value.slice(10, 12)}`
  }
  return value
}

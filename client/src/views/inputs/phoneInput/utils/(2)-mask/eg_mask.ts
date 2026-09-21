export const eg_mask = (value: string, setCountryCode: (code: string) => void) => {
  setCountryCode('eg')
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
  } else if (value.replace(/\D/g, '').length <= 8) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 8)}`
  } else if (value.replace(/\D/g, '').length <= 9) {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 8)} ${value.slice(8)}`
  } else {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 2)} ${value.slice(2, 5)} ${value.slice(5, 8)} ${value.slice(8, 12)}`
  }

  return value
}

export const ac_mask = (value: string, setCountryCode: (code: string) => void) => {
  setCountryCode('ac')
  if (value.replace(/\D/g, '').length <= 3) {
    value = value.replace(/\D/g, '')
    value = `+${value}`
  } else {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 7)}`
  }
  return value
}

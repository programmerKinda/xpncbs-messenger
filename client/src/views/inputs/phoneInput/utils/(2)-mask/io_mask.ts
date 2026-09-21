export const io_mask = (value: string, setCountryCode: (code: string) => void) => {
  setCountryCode('io')
  if (value.replace(/\D/g, '').length <= 3) {
    value = value.replace(/\D/g, '')
    value = `+${value}`
    console.log(value.length)
  } else {
    value = value.replace(/\D/g, '')
    value = `+${value.slice(0, 3)} ${value.slice(3, 7)}`
  }
  return value
}

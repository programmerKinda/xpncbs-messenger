export const plus_seven_mask = (value: string, setCountryCode: (code: string) => void) => {
  if (value.length <= 1) {
    value = `+${value}`
    setCountryCode('ru')
  } else if (value.length <= 4) {
    if (value[1] === '7') {
      setCountryCode('kz')
    } else {
      setCountryCode('ru')
    }
    value = `+${value.slice(0, 1)} (${value.slice(1)}`
  } else if (value.length <= 7) {
    value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4)}`
  } else if (value.length <= 9) {
    value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7)}`
  } else {
    value = `+${value.slice(0, 1)} (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7, 9)}-${value.slice(9, 11)}`
  }
  return value
}

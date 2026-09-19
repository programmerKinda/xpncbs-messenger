import { al_mask } from './al-mask'
import { ad_mask } from './ad_mask'
import { am_mask } from './am_mask'
import { by_mask } from './by_mask'
import { be_mask } from './be_mask'
import { ba_mask } from './ba_mask'
import { bg_mask } from './bg_mask'
import { hr_mask } from './hr_mask'
const masks: Record<string, (value: string, setCountryCode: (code: string) => void) => string> = {
  '+32': be_mask,
  '+355': al_mask,
  '+359': bg_mask,
  '+374': am_mask,
  '+375': by_mask,
  '+376': ad_mask,
  '+385': hr_mask,
  '+387': ba_mask,
}

export const plus_three_mask = (value: string, setCountryCode: (code: string) => void) => {
  for (const code in masks) {
    if (value.startsWith(code)) {
      return masks[code](value, setCountryCode)
    }
  }

  setCountryCode('not-chosen')
  return value
}

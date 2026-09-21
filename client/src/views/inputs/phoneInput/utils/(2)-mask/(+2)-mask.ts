import { dz_mask } from './dz-mask'
import { ao_mask } from './ao-mask'
import { aw_mask } from './aw-mask'
import { ac_mask } from './ac_mask'
import { io_mask } from './io_mask'
import { bw_mask } from './bw_mask'
import { bj_mask } from './bj_mask'
import { eg_mask } from './eg_mask'
import { za_mask } from './za_mask'
import { bf_mask } from './bf_mask'
import { bi_mask } from './bi_mask'
import { cm_mask } from './cm_mask'
import { cv_mask } from './cv_mask'
import { cf_mask } from './cf_mask'
import { td_mask } from './td_mask'
import { km_mask } from './km_mask'
import { cd_mask } from './cd_mask'
import { cg_mask } from './cg_mask'
import { ci_mask } from './ci_mask'
import { dj_mask } from './dj_mask'
import { gq_mask } from './gq'
import { er_mask } from './er_mask'
import { sz_mask } from './sz_mask'
import { et_mask } from './et_mask'
import { fo_mask } from './fo_mask'
import { ga_mask } from './ga_mask'
import { gm_mask } from './gm_mask'
import { gh_mask } from './gh_mask'
import { gl_mask } from './gl_mask'
import { gn_mask } from './gn_mask'
import { gw_mask } from './gw_mask'
import { ke_mask } from './ke_mask'
import { ls_mask } from './ls_mask'
import { lr_mask } from './lr_mask'
import { ly_mask } from './ly_mask'
import { mg_mask } from './mg_mask'
import { mw_mask } from './mw_mask'
import { ml_mask } from './ml_mask'
import { mr_mask } from './mr_mask'
import { mu_mask } from './mu_mask'
import { ma_mask } from './ma_mask'
import { mz_mask } from './mz_mask'
import { na_mask } from './na_mask'
import { ne_mask } from './ne_mask'
import { ng_mask } from './ng_mask'
import { rw_mask } from './rw_mask'
import { st_mask } from './st_mask'
import { sn_mask } from './sn_mask'
import { sc_mask } from './sc_mask'
import { sl_mask } from './sl_mask'
import { so_mask } from './so_mask'
import { ss_mask } from './ss_mask'
import { sd_mask } from './sd_mask'
import { tz_mask } from './tz_mask'
import { tg_mask } from './tg_mask'
import { tn_mask } from './tn_mask'
import { ug_mask } from './ug_mask'
import { zm_mask } from './zm_mask'
const masks: Record<string, (value: string, setCountryCode: (code: string) => void) => string> = {
  '+20': eg_mask,
  '+27': za_mask,
  '+211': ss_mask,
  '+212': ma_mask,
  '+213': dz_mask,
  '+216': tn_mask,
  '+218': ly_mask,
  '+220': gm_mask,
  '+221': sn_mask,
  '+222': mr_mask,
  '+223': ml_mask,
  '+224': gn_mask,
  '+225': ci_mask,
  '+226': bf_mask,
  '+227': ne_mask,
  '+228': tg_mask,
  '+229': bj_mask,
  '+230': mu_mask,
  '+231': lr_mask,
  '+232': sl_mask,
  '+233': gh_mask,
  '+234': ng_mask,
  '+235': td_mask,
  '+236': cf_mask,
  '+237': cm_mask,
  '+238': cv_mask,
  '+239': st_mask,
  '+240': gq_mask,
  '+241': ga_mask,
  '+242': cg_mask,
  '+243': cd_mask,
  '+244': ao_mask,
  '+245': gw_mask,
  '+246': io_mask,
  '+247': ac_mask,
  '+248': sc_mask,
  '+249': sd_mask,
  '+250': rw_mask,
  '+251': et_mask,
  '+252': so_mask,
  '+253': dj_mask,
  '+254': ke_mask,
  '+255': tz_mask,
  '+256': ug_mask,
  '+257': bi_mask,
  '+258': mz_mask,
  '+260': zm_mask,
  '+261': mg_mask,
  '+264': na_mask,
  '+265': mw_mask,
  '+266': ls_mask,
  '+267': bw_mask,
  '+268': sz_mask,
  '+269': km_mask,
  '+291': er_mask,
  '+297': aw_mask,
  '+298': fo_mask,
  '+299': gl_mask,
}

export const plus_two_mask = (value: string, setCountryCode: (code: string) => void) => {
  for (const code in masks) {
    if (value.startsWith(code)) {
      return masks[code](value, setCountryCode)
    }
  }

  setCountryCode('not-chosen')
  return value
}

import { create } from 'zustand'
import type {
  CallLogEntry,
  CallStatus,
  OutgoingCallRequest,
} from '@/models/call'

export type { CallLogEntry, CallStatus, OutgoingCallRequest } from '@/models/call'

const CALL_HISTORY_KEY = 'xpncbs-call-history-v1'

let callRingtone: HTMLAudioElement | null = null
let phoneRinging: HTMLAudioElement | null = null

const stopCallRingtone = () => {
  const audios = [callRingtone, phoneRinging]
  for (const audio of audios) {
    if (!audio) continue

    audio.pause()
    audio.currentTime = 0
    audio.src = ''
  }
  callRingtone = null
  phoneRinging = null
}

const playCallRingtone = () => {
  if (typeof window === 'undefined') return

  if (callRingtone) {
    callRingtone.currentTime = 0
    void callRingtone.play().catch(() => undefined)
    return
  }

  const audio = new Audio('/api/uploads/sounds/call-ringtone.mp3')
  audio.loop = true
  audio.volume = 0.8
  void audio.play().catch(() => undefined)
  callRingtone = audio
}

const playPhoneRinging = () => {
  if (typeof window === 'undefined') return

  if (phoneRinging) {
    phoneRinging.currentTime = 0
    void phoneRinging.play().catch(() => undefined)
    return
  }

  const audio = new Audio('/api/uploads/sounds/phone-ringing.mp3')
  audio.loop = true
  audio.volume = 0.8
  void audio.play().catch(() => undefined)
  phoneRinging = audio
}

export { playCallRingtone, playPhoneRinging, stopCallRingtone }

const readCallHistory = (): CallLogEntry[] => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(CALL_HISTORY_KEY)
    return raw ? (JSON.parse(raw) as CallLogEntry[]) : []
  } catch {
    return []
  }
}

const writeCallHistory = (calls: CallLogEntry[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(calls))
}

interface CallState {
  outgoingRequest: OutgoingCallRequest | null
  callHistory: CallLogEntry[]
  requestCall: (request: OutgoingCallRequest) => void
  clearRequest: () => void
  recordCallStarted: (entry: CallLogEntry) => void
  updateCallStatus: (callId: string, status: CallStatus, durationSeconds?: number) => void
}

export const useCallStore = create<CallState>((set) => ({
  outgoingRequest: null,
  callHistory: readCallHistory(),
  requestCall: (request) => {
    playPhoneRinging()
    set({ outgoingRequest: request })
  },
  clearRequest: () => {
    set({ outgoingRequest: null })
  },
  recordCallStarted: (entry) =>
    set((state) => {
      const next = [entry, ...state.callHistory.filter((call) => call.callId !== entry.callId)]
      writeCallHistory(next)
      return { callHistory: next }
    }),
  updateCallStatus: (callId, status, durationSeconds = 0) =>
    set((state) => {
      const next = state.callHistory.map((call) =>
        call.callId === callId
          ? {
              ...call,
              status,
              durationSeconds,
            }
          : call,
      )
      writeCallHistory(next)
      return { callHistory: next }
    }),
}))
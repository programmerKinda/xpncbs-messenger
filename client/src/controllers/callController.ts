import { create } from 'zustand'
import type {
  CallLogEntry,
  CallStatus,
  OutgoingCallRequest,
} from '@/models/call'

export type { CallLogEntry, CallStatus, OutgoingCallRequest } from '@/models/call'

const CALL_HISTORY_KEY = 'xpncbs-call-history-v1'

let callRingtone: HTMLAudioElement | null = null

const stopCallRingtone = () => {
  if (!callRingtone) return

  callRingtone.pause()
  callRingtone.currentTime = 0
  callRingtone.src = ''
  callRingtone = null
}

const playCallRingtone = () => {
  if (typeof window === 'undefined') return

  if (callRingtone) {
    callRingtone.currentTime = 0
    void callRingtone.play().catch(() => undefined)
    return
  }

  const audio = new Audio('/sounds/call-ringtone.mp3')
  audio.loop = true
  audio.volume = 0.8
  void audio.play().catch(() => undefined)
  callRingtone = audio
}

export { playCallRingtone, stopCallRingtone }

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
    playCallRingtone()
    set({ outgoingRequest: request })
  },
  clearRequest: () => {
    stopCallRingtone()
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
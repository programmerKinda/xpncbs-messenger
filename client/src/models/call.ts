export type CallType = 'audio' | 'video'
export type CallDirection = 'incoming' | 'outgoing'
export type CallStatus = 'accepted' | 'missed'

export interface OutgoingCallRequest {
  targetUserId: string
  peerName: string
  peerAvatarUrl?: string
  type: CallType
}

export interface CallLogEntry {
  callId: string
  peerId: string
  peerName: string
  peerAvatarUrl?: string
  phone: string
  direction: CallDirection
  status: CallStatus
  type: CallType
  startedAt: string
  durationSeconds: number
}

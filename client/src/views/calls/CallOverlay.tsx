import { useEffect, useRef, useState } from 'react'
import { Phone, PhoneOff, Video } from 'lucide-react'
import { io, type Socket } from 'socket.io-client'

import { stopCallRingtone, useCallStore } from '@/controllers/callController'
import type { CallType, OutgoingCallRequest } from '@/models/call'
import UserAvatar from '@/views/user/UserAvatar'
import { useAuthStore } from '@/controllers/authController'

interface IncomingCall {
  callId: string
  callerId: string
  callerName: string
  callerAvatarUrl?: string
  type: CallType
  offer: RTCSessionDescriptionInit
}

interface ActiveCall {
  callId: string
  peerId: string
  peerName: string
  peerAvatarUrl?: string
  type: CallType
}

export default function CallOverlay() {
  const outgoingRequest = useCallStore((state) => state.outgoingRequest)
  const clearRequest = useCallStore((state) => state.clearRequest)
  const currentUser = useAuthStore((state) => state.user)
  const [socketReady, setSocketReady] = useState(false)
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callError, setCallError] = useState<string | null>(null)
  const activeCallId = activeCall?.callId
  const socketRef = useRef<Socket | null>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const pendingIceCandidatesRef = useRef(new Map<string, RTCIceCandidateInit[]>())
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const activeCallRef = useRef<ActiveCall | null>(null)
  const incomingCallRef = useRef<IncomingCall | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)

  async function flushPendingIceCandidates(callId: string, peer: RTCPeerConnection) {
    const candidates = pendingIceCandidatesRef.current.get(callId) ?? []
    pendingIceCandidatesRef.current.delete(callId)
    for (const candidate of candidates) {
      await peer.addIceCandidate(candidate)
    }
  }

  const closeCall = (notifyPeer: boolean) => {
    stopCallRingtone()

    const call = activeCallRef.current ?? incomingCallRef.current
    if (call) {
      const peerId = 'peerId' in call ? call.peerId : call.callerId
      const isOutgoing = !!activeCallRef.current

      if (isOutgoing) {
        useCallStore.getState().updateCallStatus(call.callId, 'accepted', callDuration)
      } else {
        useCallStore.getState().updateCallStatus(call.callId, 'missed', callDuration)
      }

      if (notifyPeer) {
        socketRef.current?.emit('call:end', { targetUserId: peerId, callId: call.callId })
      }
    }

    peerRef.current?.close()
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop())
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause()
      remoteAudioRef.current.srcObject = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.pause()
      remoteVideoRef.current.srcObject = null
    }
    peerRef.current = null
    remoteStreamRef.current = null
    pendingIceCandidatesRef.current.clear()
    localStreamRef.current = null
    activeCallRef.current = null
    incomingCallRef.current = null
    setActiveCall(null)
    setIncomingCall(null)
    setIsConnecting(false)
    setCallError(null)
  }

  useEffect(() => {
    activeCallRef.current = activeCall
    incomingCallRef.current = incomingCall
  }, [activeCall, incomingCall])

  useEffect(() => {
    if (!activeCallId || isConnecting) {
      const resetId = window.setTimeout(() => setCallDuration(0), 0)
      return () => window.clearTimeout(resetId)
    }

    const startedAt = Date.now()
    const intervalId = window.setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [activeCallId, isConnecting])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = io(window.location.origin, { auth: { token } })
    socketRef.current = socket
    socket.on('connect', () => setSocketReady(true))
    socket.on('call:incoming', (call: IncomingCall) => {
      if (activeCallRef.current) return
      pendingIceCandidatesRef.current.set(call.callId, [])
      useCallStore.getState().recordCallStarted({
        callId: call.callId,
        peerId: call.callerId,
        peerName: call.callerName,
        peerAvatarUrl: call.callerAvatarUrl,
        phone: '',
        direction: 'incoming',
        status: 'missed',
        type: call.type,
        startedAt: new Date().toISOString(),
        durationSeconds: 0,
      })
      setIncomingCall(call)
    })
    socket.on('call:answered', async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
      if (data.callId === activeCallRef.current?.callId) {
        await peerRef.current?.setRemoteDescription(data.answer)
        if (peerRef.current) await flushPendingIceCandidates(data.callId, peerRef.current)
        setIsConnecting(false)
      }
    })
    socket.on('call:ice', async (data: { callId: string; candidate: RTCIceCandidateInit }) => {
      if (
        data.callId === activeCallRef.current?.callId ||
        data.callId === incomingCallRef.current?.callId ||
        pendingIceCandidatesRef.current.has(data.callId)
      ) {
        const peer = peerRef.current
        if (!peer || !peer.remoteDescription) {
          const candidates = pendingIceCandidatesRef.current.get(data.callId) ?? []
          candidates.push(data.candidate)
          pendingIceCandidatesRef.current.set(data.callId, candidates)
          return
        }
        await peer.addIceCandidate(data.candidate)
      }
    })
    socket.on('call:ended', (data: { callId: string }) => {
      if (data.callId === activeCallRef.current?.callId || data.callId === incomingCallRef.current?.callId) {
        closeCall(false)
      }
    })

    return () => {
      socket.disconnect()
      closeCall(false)
    }
  }, [])

  useEffect(() => {
    if (!localVideoRef.current || !localStreamRef.current) return
    localVideoRef.current.muted = true
    localVideoRef.current.volume = 0
    localVideoRef.current.srcObject = localStreamRef.current
  }, [activeCall, isConnecting])

  const createPeer = (callId: string, peerId: string, type: CallType) => {
    if (!pendingIceCandidatesRef.current.has(callId)) {
      pendingIceCandidatesRef.current.set(callId, [])
    }
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('call:ice', {
          targetUserId: peerId,
          callId,
          candidate: event.candidate.toJSON(),
        })
      }
    }
    peer.ontrack = (event) => {
      const remoteStream = remoteStreamRef.current ?? new MediaStream()
      if (!remoteStream.getTracks().some((track) => track.id === event.track.id)) {
        remoteStream.addTrack(event.track)
      }
      remoteStreamRef.current = remoteStream

      if (type === 'video' && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
      if (type === 'audio' && event.track.kind === 'audio' && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream
        remoteAudioRef.current.muted = false
        remoteAudioRef.current.volume = 0.8
      }
    }
    localStreamRef.current?.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current!))
    peerRef.current = peer
    return peer
  }

  const startOutgoingCall = async (request: OutgoingCallRequest) => {
    const callId = crypto.randomUUID()
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: request.type === 'video',
    })
    localStreamRef.current = stream
    const peer = createPeer(callId, request.targetUserId, request.type)
    useCallStore.getState().recordCallStarted({
      callId,
      peerId: request.targetUserId,
      peerName: request.peerName,
      peerAvatarUrl: request.peerAvatarUrl,
      phone: '',
      direction: 'outgoing',
      status: 'accepted',
      type: request.type,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
    })
    setActiveCall({
      callId,
      peerId: request.targetUserId,
      peerName: request.peerName,
      peerAvatarUrl: request.peerAvatarUrl,
      type: request.type,
    })
    setIsConnecting(true)
    const offer = await peer.createOffer()
    await peer.setLocalDescription(offer)
    socketRef.current?.emit('call:offer', {
      targetUserId: request.targetUserId,
      callId,
      type: request.type,
      offer,
      callerName: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName ?? ''}`.trim()
        : 'Пользователь',
      callerAvatarUrl: currentUser?.avatarUrl ?? undefined,
    })
    clearRequest()
  }

  useEffect(() => {
    if (!outgoingRequest || !socketReady || activeCall || incomingCall) return

    const startCallId = window.setTimeout(() => {
      void startOutgoingCall(outgoingRequest).catch(() => {
        clearRequest()
        setCallError('Не удалось получить доступ к микрофону или камере')
      })
    }, 0)

    return () => window.clearTimeout(startCallId)
  }, [outgoingRequest, socketReady, activeCall, incomingCall])

  const acceptIncomingCall = async () => {
    if (!incomingCall) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: incomingCall.type === 'video',
      })
      localStreamRef.current = stream
      const peer = createPeer(incomingCall.callId, incomingCall.callerId, incomingCall.type)
      useCallStore.getState().updateCallStatus(incomingCall.callId, 'accepted', 0)
      await peer.setRemoteDescription(incomingCall.offer)
      await flushPendingIceCandidates(incomingCall.callId, peer)
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      socketRef.current?.emit('call:answer', {
        targetUserId: incomingCall.callerId,
        callId: incomingCall.callId,
        answer,
      })
      setActiveCall({
        callId: incomingCall.callId,
        peerId: incomingCall.callerId,
        peerName: incomingCall.callerName,
        peerAvatarUrl: incomingCall.callerAvatarUrl,
        type: incomingCall.type,
      })
      setIncomingCall(null)
      setIsConnecting(false)
    } catch {
      setCallError('Не удалось получить доступ к микрофону или камере')
    }
  }

  if (!incomingCall && !activeCall && !callError) return null

  return (
    <div className="call-overlay">
      <div className="call-overlay__card">
        {callError ? (
          <>
            <p className="call-overlay__eyebrow">Звонок недоступен</p>
            <p className="call-overlay__error">{callError}</p>
            <button type="button" className="call-overlay__decline" onClick={() => setCallError(null)}>
              Закрыть
            </button>
          </>
        ) : incomingCall && !activeCall ? (
          <>
            <p className="call-overlay__eyebrow">Входящий звонок</p>
            <UserAvatar
              id={incomingCall.callerId}
              name={incomingCall.callerName}
              avatarURL={incomingCall.callerAvatarUrl ?? ''}
              size={88}
            />
            <h2>{incomingCall.callerName}</h2>
            <div className="call-overlay__actions">
              <button type="button" className="call-overlay__accept" onClick={() => void acceptIncomingCall()}>
                {incomingCall.type === 'video' ? <Video /> : <Phone />}
              </button>
              <button type="button" className="call-overlay__decline" onClick={() => closeCall(true)}>
                <PhoneOff />
              </button>
            </div>
          </>
        ) : activeCall ? (
          <>
            <p className="call-overlay__eyebrow">{isConnecting ? 'Соединение...' : 'Звонок'}</p>
            <UserAvatar
              id={activeCall.peerId}
              name={activeCall.peerName}
              avatarURL={activeCall.peerAvatarUrl ?? ''}
              size={88}
            />
            <h2>{activeCall.peerName}</h2>
            {!isConnecting && (
              <span className="call-overlay__duration">
                {Math.floor(callDuration / 60).toString().padStart(2, '0')}:
                {(callDuration % 60).toString().padStart(2, '0')}
              </span>
            )}
            {activeCall.type === 'video' && (
              <div className="call-overlay__video-grid">
                <video className="call-overlay__remote-video" ref={remoteVideoRef} autoPlay playsInline />
                <video
                  className="call-overlay__local-video"
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  aria-label="Ваше видео"
                />
              </div>
            )}
            {activeCall.type === 'audio' && <audio ref={remoteAudioRef} autoPlay />}
            <button type="button" className="call-overlay__decline" onClick={() => closeCall(true)}>
              <PhoneOff />
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  CameraOff,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Phone,
  PhoneOff,
  Video,
} from 'lucide-react'
import { io, type Socket } from 'socket.io-client'

import { playCallRingtone, stopCallRingtone, useCallStore } from '@/controllers/callController'
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

const playRemoteAudio = (audioElement: HTMLAudioElement | null, stream: MediaStream | null) => {
  if (!audioElement || !stream) return

  audioElement.srcObject = stream
  audioElement.muted = false
  audioElement.volume = 0.8
  void audioElement.play().catch(() => undefined)
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
  const [callNotice, setCallNotice] = useState<string | null>(null)
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true)
  const [isCameraEnabled, setIsCameraEnabled] = useState(false)
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
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
  const callWindowRef = useRef<HTMLElement>(null)

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
    setCallNotice(null)
    setIsMicrophoneEnabled(true)
    setIsCameraEnabled(false)
    setHasRemoteVideo(false)
  }

  useEffect(() => {
    activeCallRef.current = activeCall
    incomingCallRef.current = incomingCall
  }, [activeCall, incomingCall])

  useEffect(() => {
    if (activeCall?.type === 'audio') {
      playRemoteAudio(remoteAudioRef.current, remoteStreamRef.current)
    }
  }, [activeCall])

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

  const markCallAsVideo = (callId: string) => {
    const entry = useCallStore.getState().callHistory.find((call) => call.callId === callId)
    if (entry) {
      useCallStore.getState().recordCallStarted({ ...entry, type: 'video' })
    }
  }

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
      playCallRingtone()
      setIncomingCall(call)
    })
    socket.on('call:answered', async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
      if (data.callId === activeCallRef.current?.callId) {
        stopCallRingtone()
        await peerRef.current?.setRemoteDescription(data.answer)
        if (peerRef.current) await flushPendingIceCandidates(data.callId, peerRef.current)
        setIsConnecting(false)
      }
    })
    socket.on(
      'call:renegotiate',
      async (data: { callId: string; offer: RTCSessionDescriptionInit }) => {
        const call = activeCallRef.current
        const peer = peerRef.current
        if (!call || call.callId !== data.callId || !peer) return

        try {
          await peer.setRemoteDescription(data.offer)
          await flushPendingIceCandidates(data.callId, peer)
          const answer = await peer.createAnswer()
          await peer.setLocalDescription(answer)
          socket.emit('call:renegotiate:answer', {
            targetUserId: call.peerId,
            callId: data.callId,
            answer,
          })
          setActiveCall((current) =>
            current?.callId === data.callId ? { ...current, type: 'video' } : current,
          )
          markCallAsVideo(data.callId)
          setCallNotice(null)
        } catch {
          setCallNotice('Не удалось подключить видео')
        }
      },
    )
    socket.on(
      'call:renegotiated',
      async (data: { callId: string; answer: RTCSessionDescriptionInit }) => {
        if (data.callId !== activeCallRef.current?.callId || !peerRef.current) return
        try {
          await peerRef.current.setRemoteDescription(data.answer)
          await flushPendingIceCandidates(data.callId, peerRef.current)
          setCallNotice(null)
        } catch {
          setCallNotice('Не удалось подключить видео')
        }
      },
    )
    socket.on('call:ice', async (data: { callId: string; candidate: RTCIceCandidateInit }) => {
      if (
        data.callId === activeCallRef.current?.callId ||
        data.callId === incomingCallRef.current?.callId ||
        pendingIceCandidatesRef.current.has(data.callId)
      ) {
        const peer = peerRef.current
        const remoteDescription = peer?.remoteDescription
        const remoteMediaSections = remoteDescription?.sdp?.match(/^m=/gm)?.length ?? 0
        const candidateMatchesRemoteDescription = data.candidate.sdpMid
          ? remoteDescription?.sdp
              ?.split(/\r?\n/)
              .includes(`a=mid:${data.candidate.sdpMid}`) ?? false
          : data.candidate.sdpMLineIndex == null ||
            data.candidate.sdpMLineIndex < remoteMediaSections

        if (!peer || !remoteDescription || !candidateMatchesRemoteDescription) {
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

  useEffect(() => {
    if (!remoteVideoRef.current || !remoteStreamRef.current) return
    remoteVideoRef.current.srcObject = remoteStreamRef.current
  }, [activeCall, hasRemoteVideo])

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === callWindowRef.current)
    }
    document.addEventListener('fullscreenchange', updateFullscreenState)
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState)
  }, [])

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

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
      if (event.track.kind === 'video') {
        setHasRemoteVideo(true)
      }
      if (type === 'audio' && event.track.kind === 'audio') {
        playRemoteAudio(remoteAudioRef.current, remoteStream)
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
    setIsCameraEnabled(request.type === 'video')
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
    stopCallRingtone()
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
      setIsCameraEnabled(incomingCall.type === 'video')
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

  const isIncoming = Boolean(incomingCall && !activeCall)
  const callType = activeCall?.type ?? incomingCall?.type
  const peerId = activeCall?.peerId ?? incomingCall?.callerId ?? 'call'
  const peerName = activeCall?.peerName ?? incomingCall?.callerName ?? 'Звонок'
  const peerAvatarUrl = activeCall?.peerAvatarUrl ?? incomingCall?.callerAvatarUrl ?? ''

  const toggleMicrophone = () => {
    const enabled = !isMicrophoneEnabled
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = enabled
    })
    setIsMicrophoneEnabled(enabled)
  }

  const toggleCamera = () => {
    if (isConnecting) return

    if (isCameraEnabled) {
      localStreamRef.current?.getVideoTracks().forEach((track) => {
        track.enabled = false
      })
      setIsCameraEnabled(false)
      return
    }

    void (async () => {
      const call = activeCallRef.current
      const peer = peerRef.current
      const stream = localStreamRef.current
      if (!call || !peer || !stream) return

      try {
        let videoTrack = stream.getVideoTracks().find((track) => track.readyState === 'live')
        if (!videoTrack) {
          const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true })
          videoTrack = cameraStream.getVideoTracks()[0]
          if (!videoTrack) throw new Error('Camera track unavailable')

          stream.addTrack(videoTrack)
          peer.addTrack(videoTrack, stream)
          const offer = await peer.createOffer()
          await peer.setLocalDescription(offer)
          setActiveCall((current) =>
            current?.callId === call.callId ? { ...current, type: 'video' } : current,
          )
          markCallAsVideo(call.callId)
          socketRef.current?.emit('call:renegotiate', {
            targetUserId: call.peerId,
            callId: call.callId,
            offer,
          })
        }

        videoTrack.enabled = true
        setIsCameraEnabled(true)
        setCallNotice(null)
      } catch {
        setCallNotice('Не удалось включить камеру. Проверьте разрешение браузера.')
      }
    })()
  }

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await callWindowRef.current?.requestFullscreen()
    }
  }

  const durationLabel = `${Math.floor(callDuration / 60).toString().padStart(2, '0')}:${
    (callDuration % 60).toString().padStart(2, '0')
  }`

  return (
    <div className="call-overlay">
      <section ref={callWindowRef} className="call-overlay__window" aria-label="Окно звонка">
        <header className="call-overlay__header">
          <div className="call-overlay__heading">
            <span className="call-overlay__type-icon" aria-hidden="true">
              {callType === 'video' ? <Video size={19} /> : <Phone size={19} />}
            </span>
            <div className="call-overlay__heading-copy">
              <p className="call-overlay__eyebrow">
                {callError
                  ? 'Ошибка соединения'
                  : isIncoming
                    ? 'Входящий звонок'
                    : callType === 'video'
                      ? 'Видеозвонок'
                      : 'Аудиозвонок'}
              </p>
              <h2>{callError ? 'Звонок не состоялся' : peerName}</h2>
            </div>
          </div>
          <div className="call-overlay__header-actions">
            <span
              className={`call-overlay__status ${callError ? 'call-overlay__status--error' : ''}`}
              role="status"
            >
              <span className="call-overlay__status-dot" />
              {callError ? 'Недоступен' : isIncoming ? 'Входящий' : isConnecting ? 'Ожидание' : 'На связи'}
            </span>
            {activeCall && !callError && (
              <button
                type="button"
                className="call-overlay__fullscreen"
                onClick={() => void toggleFullscreen()}
                aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
                title={isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            )}
          </div>
        </header>

        <main className={`call-overlay__stage ${callType === 'audio' ? 'call-overlay__stage--audio' : ''}`}>
          {activeCall?.type === 'video' && (
            <video
              className="call-overlay__remote-video"
              ref={remoteVideoRef}
              autoPlay
              playsInline
              aria-label={`Видео собеседника: ${peerName}`}
            />
          )}
          {(!hasRemoteVideo || callType !== 'video' || isIncoming || callError) && (
            <div className="call-overlay__waiting">
              <UserAvatar id={peerId} name={peerName} avatarURL={peerAvatarUrl} size={128} />
              <span>
                {callError
                  ? callError
                  : isIncoming
                    ? 'Звонит вам'
                    : isConnecting
                      ? 'Ожидание ответа'
                      : callType === 'audio'
                        ? 'Аудиозвонок'
                        : 'Подключаем видео'}
              </span>
            </div>
          )}
          {activeCall?.type === 'video' && (
            <div className="call-overlay__local-preview">
              {isCameraEnabled ? (
                <video
                  className="call-overlay__local-video"
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  aria-label="Ваше видео"
                />
              ) : (
                <div className="call-overlay__camera-off">
                  <CameraOff size={22} />
                  <span>Камера выключена</span>
                </div>
              )}
              <span className="call-overlay__local-name">Вы</span>
            </div>
          )}
          <div className="call-overlay__stage-caption">
            <strong>{peerName}</strong>
            <span>{isConnecting ? 'Вызов...' : isIncoming ? 'Ожидает ответа' : callError ? '' : durationLabel}</span>
          </div>
          {callNotice && (
            <div className="call-overlay__notice" role="status">
              {callNotice}
            </div>
          )}
          {activeCall?.type === 'audio' && <audio ref={remoteAudioRef} autoPlay />}
        </main>

        <footer className="call-overlay__footer">
          {callError ? (
            <button type="button" className="call-overlay__close-error" onClick={() => setCallError(null)}>
              Закрыть
            </button>
          ) : isIncoming ? (
            <div className="call-overlay__incoming-actions">
              <button
                type="button"
                className="call-overlay__accept"
                onClick={() => void acceptIncomingCall()}
              >
                {callType === 'video' ? <Video size={20} /> : <Phone size={20} />}
                Ответить
              </button>
              <button
                type="button"
                className="call-overlay__decline"
                onClick={() => closeCall(true)}
                aria-label="Отклонить звонок"
              >
                <PhoneOff size={20} />
                Отклонить
              </button>
            </div>
          ) : activeCall ? (
            <>
              <div className="call-overlay__footer-info">
                <span>{isConnecting ? 'Соединяем вас' : 'Звонок идёт'}</span>
                {!isConnecting && <strong>{durationLabel}</strong>}
              </div>
              <div className="call-overlay__controls">
                <button
                  type="button"
                  className={`call-overlay__control ${!isMicrophoneEnabled ? 'call-overlay__control--off' : ''}`}
                  onClick={toggleMicrophone}
                  aria-label={isMicrophoneEnabled ? 'Выключить микрофон' : 'Включить микрофон'}
                  title={isMicrophoneEnabled ? 'Выключить микрофон' : 'Включить микрофон'}
                >
                  {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button
                  type="button"
                  className={`call-overlay__control ${!isCameraEnabled ? 'call-overlay__control--off' : ''}`}
                  onClick={toggleCamera}
                  disabled={isConnecting}
                  aria-label={isCameraEnabled ? 'Выключить камеру' : 'Включить камеру'}
                  title={isCameraEnabled ? 'Выключить камеру' : 'Включить камеру'}
                >
                  {isCameraEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
                </button>
                <button
                  type="button"
                  className="call-overlay__decline call-overlay__end-call"
                  onClick={() => closeCall(true)}
                  aria-label="Завершить звонок"
                  title="Завершить звонок"
                >
                  <PhoneOff size={21} />
                </button>
              </div>
              <span className="call-overlay__footer-spacer" aria-hidden="true" />
            </>
          ) : null}
        </footer>
      </section>
    </div>
  )
}
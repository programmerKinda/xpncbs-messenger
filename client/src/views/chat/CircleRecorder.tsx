import { useEffect, useRef } from 'react'
import { Square } from 'lucide-react'

interface CircleRecorderProps {
  isRecording: boolean
  onRecordingComplete: (blob: Blob, duration: number) => void
  onRecordingError?: () => void
  onStopRecording: () => void
}

export default function CircleRecorder({
  isRecording,
  onRecordingComplete,
  onRecordingError,
  onStopRecording,
}: CircleRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onRecordingCompleteRef = useRef(onRecordingComplete)
  const onRecordingErrorRef = useRef(onRecordingError)

  useEffect(() => {
    onRecordingCompleteRef.current = onRecordingComplete
    onRecordingErrorRef.current = onRecordingError
  }, [onRecordingComplete, onRecordingError])

  useEffect(() => {
    if (!isRecording) return

    let cancelled = false
    let stream: MediaStream | null = null
    let recorder: MediaRecorder | null = null
    let startedAt: number | null = null
    const chunks: Blob[] = []

    const startRecording = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        const activeStream = stream
        if (videoRef.current) videoRef.current.srcObject = activeStream

        const mimeType = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
          .find((type) => MediaRecorder.isTypeSupported(type))
        recorder = new MediaRecorder(activeStream, mimeType ? { mimeType } : undefined)
        startedAt = Date.now()
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data)
        }
        recorder.onstop = () => {
          const duration = startedAt ? (Date.now() - startedAt) / 1000 : 0
          const blob = new Blob(chunks, { type: recorder?.mimeType || 'video/webm' })
          activeStream.getTracks().forEach((track) => track.stop())
          if (blob.size > 0 && duration >= 0.3) {
            onRecordingCompleteRef.current(blob, duration)
          }
        }
        recorder.start(200)
      } catch {
        onRecordingErrorRef.current?.()
      }
    }

    void startRecording()

    return () => {
      cancelled = true
      if (recorder?.state === 'recording') {
        recorder.stop()
      } else {
        stream?.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isRecording])

  if (!isRecording) return null

  return (
    <div className="circle-recorder__overlay">
      <div className="circle-recorder__stage">
        <video
          ref={videoRef}
          className="circle-recorder__preview"
          autoPlay
          muted
          playsInline
        />
        <p>Запись кружочка</p>
        <button type="button" aria-label="Остановить запись" onClick={onStopRecording}>
          <Square size={25} fill="currentColor" />
        </button>
      </div>
    </div>
  )
}

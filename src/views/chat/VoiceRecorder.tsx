import React, { useRef, useState, useEffect } from 'react'
import '../../styles/components/VoiceRecorder.css'
interface VoiceRecorderProps {
  isRecording: boolean
}
function formatTime(s: number) {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

const VoiceWaveRecorder: React.FC<VoiceRecorderProps> = ({ isRecording }) => {
  const [elapsed, setElapsed] = useState(0)
  const [bars, setBars] = useState<number[]>(new Array(50).fill(2))

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    streamRef.current = stream

    const audioContext = new AudioContext()
    audioContextRef.current = audioContext

    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()

    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.85
    source.connect(analyser)

    analyserRef.current = analyser
    dataArrayRef.current = new Uint8Array(analyser.fftSize)

    // start timer
    startTimeRef.current = Date.now()
    setElapsed(0)
    timerRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }
    }, 250) as unknown as number

    drawWave()
  }

  const lastUpdateRef = useRef(0)

  const drawWave = (timestamp = 0) => {
    if (!analyserRef.current || !dataArrayRef.current) {
      rafRef.current = requestAnimationFrame(drawWave)
      return
    }

    // обновляем только каждые 100 мс
    if (timestamp - lastUpdateRef.current < 30) {
      rafRef.current = requestAnimationFrame(drawWave)
      return
    }

    lastUpdateRef.current = timestamp

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current)

    let sum = 0
    const buffer = dataArrayRef.current

    for (let i = 0; i < buffer.length; i++) {
      const v = buffer[i] - 128
      sum += v * v
    }

    const rms = Math.sqrt(sum / buffer.length)
    const norm = Math.min(1, rms / 128)
    const height = Math.max(4, Math.round(norm * 150))

    setBars((prev) => [...prev.slice(1), height])

    rafRef.current = requestAnimationFrame(drawWave)
  }

  const stopRecording = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioContextRef.current?.close()

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    startTimeRef.current = null
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      audioContextRef.current?.close()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])
  useEffect(() => {
    if (isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }, [isRecording])

  return (
    <div className="voice-wrapper">
      <div className="record-panel">
        <div className="dot" />
        <div className="rec-info">
          <span className="rec-timer">{formatTime(elapsed)}</span>
        </div>

        <div className="wave">
          {bars.map((height, index) => (
            <div key={index} className="bar" style={{ height: `${height}px`, opacity: 0.7 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default VoiceWaveRecorder

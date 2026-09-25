import React, { useRef, useState, useEffect } from 'react'
import '../../styles/components/VoiceRecorder.css'
interface VoiceRecorderProps {
  isRecording: boolean
  discard?: boolean
  onRecordingComplete?: (blob: Blob, duration: number, waveform: number[]) => void
}
function formatTime(s: number) {
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

async function createWaveform(blob: Blob, barsCount: number): Promise<{
  duration: number
  waveform: number[]
}> {
  const context = new AudioContext()

  try {
    const audioBuffer = await context.decodeAudioData(await blob.arrayBuffer())
    const channelCount = audioBuffer.numberOfChannels
    const samplesPerBar = Math.max(1, Math.floor(audioBuffer.length / barsCount))
    const rawWaveform = Array.from({ length: barsCount }, (_, barIndex) => {
      const start = barIndex * samplesPerBar
      const end = Math.min(audioBuffer.length, start + samplesPerBar)
      let sum = 0
      let sampleCount = 0

      for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
        let amplitude = 0
        for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
          amplitude += Math.abs(audioBuffer.getChannelData(channelIndex)[sampleIndex])
        }
        sum += amplitude / channelCount
        sampleCount += 1
      }

      return sampleCount > 0 ? sum / sampleCount : 0
    })

    const maxAmplitude = Math.max(...rawWaveform, 0.001)
    return {
      duration: audioBuffer.duration,
      waveform: rawWaveform.map((amplitude) => amplitude / maxAmplitude),
    }
  } finally {
    await context.close()
  }
}

const VoiceWaveRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  discard = false,
  onRecordingComplete,
}) => {
  const [elapsed, setElapsed] = useState(0)
  const [bars, setBars] = useState<number[]>(new Array(50).fill(2))

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const barsRef = useRef<number[]>(new Array(50).fill(2))
  const discardRef = useRef(discard)
  const durationRef = useRef(0)

  useEffect(() => {
    discardRef.current = discard
  }, [discard])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    streamRef.current = stream

    const mediaRecorder = new MediaRecorder(stream)
    chunksRef.current = []
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    }
    mediaRecorder.onstop = async () => {
      if (discardRef.current || chunksRef.current.length === 0) return

      const blob = new Blob(chunksRef.current, {
        type: mediaRecorder.mimeType || 'audio/webm',
      })

      try {
        const audioData = await createWaveform(blob, 50)
        onRecordingComplete?.(blob, audioData.duration, audioData.waveform)
      } catch {
        onRecordingComplete?.(blob, durationRef.current, barsRef.current)
      }
    }
    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()

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
    window.setTimeout(() => {
      if (mediaRecorderRef.current === mediaRecorder) {
        startTimeRef.current = Date.now()
      }
    }, 0)
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

    setBars((prev) => {
      const next = [...prev.slice(1), height]
      barsRef.current = next
      return next
    })

    rafRef.current = requestAnimationFrame(drawWave)
  }

  const stopRecording = () => {
    durationRef.current = startTimeRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : 0
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current = null
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
      stopRecording()
    }
  }, [])
  useEffect(() => {
    const actionId = window.setTimeout(() => {
      if (isRecording) {
        void startRecording()
      } else {
        stopRecording()
      }
    }, 0)

    return () => window.clearTimeout(actionId)
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

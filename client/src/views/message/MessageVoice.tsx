import React, { useState, useRef, useMemo, useEffect } from 'react'
import { type MessageVoiceContent } from '@/models/message'
import { useMediaStore } from '@/controllers/mediaPlayController'
import { Pause, Play } from 'lucide-react'

export const MessageVoice: React.FC<{
  content: MessageVoiceContent
  autoPlay?: boolean
  onEnded?: () => void
}> = ({ content, autoPlay = false, onEnded }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(content.duration)
  const [waveform, setWaveform] = useState(content.waveform)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressContainerRef = useRef<HTMLDivElement>(null)

  // Подписываемся на контроллер
  const activeId = useMediaStore((state) => state.activeId)
  const playAudio = useMediaStore((state) => state.playAudio)
  const stopAudio = useMediaStore((state) => state.stopAudio)
  const audioSource = content.content.startsWith('/uploads/')
    ? `/api${content.content}`
    : content.content

  useEffect(() => {
    let cancelled = false

    const loadAudioMetadata = async () => {
      try {
        const response = await fetch(audioSource)
        const context = new AudioContext()
        const audioBuffer = await context.decodeAudioData(await response.arrayBuffer())
        const barsCount = 50
        const samplesPerBar = Math.max(1, Math.floor(audioBuffer.length / barsCount))
        const rawWaveform = Array.from({ length: barsCount }, (_, barIndex) => {
          const start = barIndex * samplesPerBar
          const end = Math.min(audioBuffer.length, start + samplesPerBar)
          let sum = 0
          let sampleCount = 0

          for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
            let amplitude = 0
            for (let channelIndex = 0; channelIndex < audioBuffer.numberOfChannels; channelIndex += 1) {
              amplitude += Math.abs(audioBuffer.getChannelData(channelIndex)[sampleIndex])
            }
            sum += amplitude / audioBuffer.numberOfChannels
            sampleCount += 1
          }

          return sampleCount > 0 ? sum / sampleCount : 0
        })
        const maxAmplitude = Math.max(...rawWaveform, 0.001)

        if (!cancelled) {
          setAudioDuration(audioBuffer.duration)
          setWaveform(rawWaveform.map((amplitude) => amplitude / maxAmplitude))
        }

        await context.close()
      } catch {
        // Use metadata saved with the message when decoding is unavailable.
      }
    }

    void loadAudioMetadata()
    return () => {
      cancelled = true
    }
  }, [audioSource])

  // Контроллер: следим за тем, кто должен играть
  useEffect(() => {
    const isCurrentActive = activeId === content.id

    if (!isCurrentActive && isPlaying) {
      // Если в сторе другой ID, а мы играем — ПРИНУДИТЕЛЬНАЯ ПАУЗА
      audioRef.current?.pause()
      const resetStateId = window.setTimeout(() => setIsPlaying(false), 0)
      return () => window.clearTimeout(resetStateId)
    }
  }, [activeId, content.id, isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      stopAudio(content.id)
    } else {
      // Сначала уведомляем контроллер (это остановит другие плееры)
      playAudio(content.id)
      // Затем запускаем текущий
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    if (!autoPlay || !audioRef.current) return

    playAudio(content.id)
    void audioRef.current.play().then(() => setIsPlaying(true)).catch(() => undefined)
  }, [autoPlay, content.id, playAudio])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime
      const duration = Number.isFinite(audioRef.current.duration)
        ? audioRef.current.duration
        : audioDuration
      setCurrentTime(current)
      setProgress((current / duration) * 100)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressContainerRef.current && audioRef.current) {
      const rect = progressContainerRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const duration = Number.isFinite(audioRef.current.duration)
        ? audioRef.current.duration
        : audioDuration
      const newTime = (clickX / width) * duration

      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setProgress((clickX / width) * 100)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
    setCurrentTime(0)
    stopAudio(content.id)
    onEnded?.()
  }

  const bars = useMemo(() => {
    const rawData = waveform || []
    const max = Math.max(...rawData, 1)
    return rawData.map((val) => (val / max) * 20 + 2)
  }, [waveform])

  return (
    <div
      className="voice-message-container"
      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
    >
      <audio
        ref={audioRef}
        src={audioSource}
        onLoadedMetadata={(event) => {
          if (Number.isFinite(event.currentTarget.duration)) {
            setAudioDuration(event.currentTarget.duration)
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        // Убрали onPlay/onPause, так как управляем ими вручную через togglePlay и useEffect
      />

      <button className="voice-play-btn" onClick={togglePlay} type="button">
        {isPlaying ? <Pause size={20} strokeWidth={2} /> : <Play size={20} strokeWidth={2} />}
      </button>

      <div className="voice-content" style={{ flexGrow: 1 }}>
        <div
          className="voice-waveform-wrapper"
          ref={progressContainerRef}
          onClick={handleSeek}
          style={{ cursor: 'pointer', position: 'relative', height: '24px' }}
        >
          <svg
            className="voice-waveform-svg"
            preserveAspectRatio="none"
            viewBox={`0 0 ${bars.length * 4} 24`}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Фоновая волна */}
            <g className="waveform-bg" style={{ opacity: 0.3, fill: '#888' }}>
              {bars.map((height, i) => (
                <rect key={i} x={i * 4} y={12 - height / 2} width="2" height={height} rx="1" />
              ))}
            </g>

            {/* Прогресс волны */}
            <svg width={`${progress}%`} height="100%" overflow="hidden">
              <g className="waveform-progress" style={{ fill: '#007bff' }}>
                {bars.map((height, i) => (
                  <rect key={i} x={i * 4} y={12 - height / 2} width="2" height={height} rx="1" />
                ))}
              </g>
            </svg>
          </svg>
        </div>

        <div style={{ fontSize: '12px', marginTop: '4px', color: '#666' }}>
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </div>
      </div>
    </div>
  )
}

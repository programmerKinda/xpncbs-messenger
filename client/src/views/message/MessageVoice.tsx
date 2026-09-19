import React, { useState, useRef, useMemo, useEffect } from 'react'
import { getDataUrl } from '@/utils/getDataUrl'
import { type MessageVoiceContent } from '@/models/message'
import { useMediaStore } from '@/controllers/mediaPlayController'
import { Pause, Play } from 'lucide-react'

export const MessageVoice: React.FC<{ content: MessageVoiceContent }> = ({ content }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressContainerRef = useRef<HTMLDivElement>(null)

  // Подписываемся на контроллер
  const activeId = useMediaStore((state) => state.activeId)
  const playAudio = useMediaStore((state) => state.playAudio)
  const stopAudio = useMediaStore((state) => state.stopAudio)

  // Контроллер: следим за тем, кто должен играть
  useEffect(() => {
    const isCurrentActive = activeId === content.id

    if (!isCurrentActive && isPlaying) {
      // Если в сторе другой ID, а мы играем — ПРИНУДИТЕЛЬНАЯ ПАУЗА
      audioRef.current?.pause()
      setIsPlaying(false)
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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime
      const duration = audioRef.current.duration || content.duration
      setCurrentTime(current)
      setProgress((current / duration) * 100)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressContainerRef.current && audioRef.current) {
      const rect = progressContainerRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const width = rect.width
      const duration = audioRef.current.duration || content.duration
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
  }

  const bars = useMemo(() => {
    const rawData = content.waveform || []
    const max = Math.max(...rawData, 1)
    return rawData.map((val) => (val / max) * 20 + 2)
  }, [content.waveform])

  return (
    <div
      className="voice-message-container"
      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
    >
      <audio
        ref={audioRef}
        src={getDataUrl(content.content, 'audio/webm')}
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
          {formatTime(currentTime)} / {formatTime(content.duration)}
        </div>
      </div>
    </div>
  )
}

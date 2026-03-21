import React, { useState, useRef, useMemo } from 'react'
import { getDataUrl } from '@/utils/getDataUrl'
import { type MessageVoiceContent } from '@/models/message'

export const MessageVoice: React.FC<{ content: MessageVoiceContent }> = ({ content }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressContainerRef = useRef<HTMLDivElement>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play()
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
  }

  const bars = useMemo(() => {
    const rawData = content.waveform || []
    const max = Math.max(...rawData, 1)
    return rawData.map((val) => (val / max) * 20 + 2)
  }, [content.waveform])

  return (
    <div className="voice-message-container">
      <audio
        ref={audioRef}
        src={getDataUrl(content.content, 'audio/webm')}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <button className="voice-play-btn" onClick={togglePlay} type="button">
        {isPlaying ? (
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current translate-x-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="voice-content">
        <div
          className="voice-waveform-wrapper"
          ref={progressContainerRef}
          onClick={handleSeek}
          style={{ cursor: 'pointer' }}
        >
          <svg
            className="voice-waveform-svg"
            preserveAspectRatio="none"
            viewBox={`0 0 ${bars.length * 4} 24`}
          >
            <g className="waveform-bg" style={{ opacity: 0.3 }}>
              {bars.map((height, i) => (
                <rect key={i} x={i * 4} y={12 - height / 2} width="2" height={height} rx="1" />
              ))}
            </g>

            <svg width={`${progress}%`} height="100%" overflow="hidden">
              <g className="waveform-progress">
                {bars.map((height, i) => (
                  <rect key={i} x={i * 4} y={12 - height / 2} width="2" height={height} rx="1" />
                ))}
              </g>
            </svg>
          </svg>
        </div>

        <span className="voice-duration">
          {formatTime(currentTime)} / {formatTime(content.duration)}
        </span>
      </div>
    </div>
  )
}

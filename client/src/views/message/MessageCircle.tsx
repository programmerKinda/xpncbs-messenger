import { useRef, useState, useEffect } from 'react'
import { type MessageCircleContent } from '@/models/message'
import { getDataUrl } from '@/utils/getDataUrl'
import MessageCircleWaves from '../ui/MessageCircleWaves'
const SIZE = 220
const STROKE = 2
const PADDING = 3

const RADIUS = (SIZE - STROKE) / 2 - PADDING
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const formatTime = (sec: number) => {
  const minutes = Math.floor(sec / 60)
    .toString()
    .padStart(2, '0')
  const seconds = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0')
  return `${minutes}:${seconds}`
}

export const MessageCircle: React.FC<{
  content: MessageCircleContent
  autoPlay?: boolean
  onEnded?: () => void
}> = ({ content, autoPlay = false, onEnded: onMediaEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isDraggingRef = useRef(false)
  const didDragRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeDisplay, setTimeDisplay] = useState(formatTime(content.duration))

  // запуск бесконечного muted autoplay
  const startMutedLoop = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.loop = true
    video.currentTime = 0
    video.play().catch(() => {})
    setProgress(0)
    setIsSoundOn(false)
    setIsPlaying(false)
    setTimeDisplay(formatTime(content.duration))
  }

  useEffect(() => {
    const video = videoRef.current
    if (!autoPlay || !video) return

    video.loop = false
    video.currentTime = 0
    video.muted = false
    void video.play().then(() => {
      setIsSoundOn(true)
      setIsPlaying(true)
    }).catch(() => undefined)
  }, [autoPlay])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      if (isSoundOn && content.duration > 0) {
        setProgress(Math.min(1, video.currentTime / content.duration))
        setTimeDisplay(formatTime(Math.max(0, content.duration - video.currentTime)))
      }
    }

    const onEnded = () => {
      if (isSoundOn) {
        startMutedLoop()
        onMediaEnded?.()
      }
    }

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('ended', onEnded)
    }
  }, [isSoundOn, content.duration])

  const seekFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = event.currentTarget.getBoundingClientRect()
    const center = rect.width / 2
    const x = event.clientX - rect.left - center
    const y = event.clientY - rect.top - center
    const distance = Math.sqrt(x * x + y * y)

    if (distance < center - 24) return false

    const duration = content.duration || video.duration
    if (!duration) return true

    let normalized = Math.atan2(y, x) + Math.PI / 2
    if (normalized < 0) normalized += 2 * Math.PI
    const percent = normalized / (2 * Math.PI)
    video.currentTime = percent * duration
    setProgress(percent)
    setTimeDisplay(formatTime(Math.max(0, duration - video.currentTime)))

    if (!isSoundOn) {
      video.loop = false
      video.muted = false
      video.play().then(() => {
        setIsSoundOn(true)
        setIsPlaying(true)
      }).catch(() => undefined)
    }

    return true
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!seekFromPointer(event)) return
    isDraggingRef.current = true
    didDragRef.current = false
    if (event.pointerType !== 'touch') {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    didDragRef.current = true
    seekFromPointer(event)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }

    const video = videoRef.current
    if (!video) return

    const rect = event.currentTarget.getBoundingClientRect()
    const center = rect.width / 2
    const x = event.clientX - rect.left - center
    const y = event.clientY - rect.top - center
    const distance = Math.sqrt(x * x + y * y)

    if (distance < center - 24) {
      if (!isSoundOn) {
        video.loop = false
        video.currentTime = 0
        video.muted = false
        video
          .play()
          .then(() => {
            setIsSoundOn(true)
            setIsPlaying(true)
            setTimeDisplay(formatTime(content.duration))
          })
          .catch(() => console.log('Не удалось включить звук'))
      } else {
        if (video.paused) {
          video.play()
          setIsPlaying(true)
        } else {
          video.pause()

          setIsPlaying(false)
        }
      }
      return
    }
  }

  const offset = CIRCUMFERENCE * (1 - progress)

  return (
    <div>
      <div
        className={`video-circle ${!isSoundOn ? 'paused' : ''}`}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'pan-y' }}
      >
        <video
          ref={videoRef}
          src={getDataUrl(content.content)}
          className="video-circle__video"
          playsInline
          autoPlay
          muted
          loop
          preload="metadata"
          controls={false}
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
        />

        {isSoundOn && (
          <svg className="video-circle__progress" width={SIZE} height={SIZE}>
            <circle
              stroke="rgba(255,255,255,0.15)"
              fill="transparent"
              strokeWidth={STROKE}
              r={RADIUS}
              cx={SIZE / 2}
              cy={SIZE / 2}
            />
            <circle
              stroke="white"
              fill="transparent"
              strokeWidth={STROKE}
              r={RADIUS}
              cx={SIZE / 2}
              cy={SIZE / 2}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          </svg>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span>{timeDisplay}</span>
        {content.watched ? (
          <MessageCircleWaves isPlaying={isPlaying} />
        ) : (
          <>
            <span>●</span>
          </>
        )}
      </div>
    </div>
  )
}

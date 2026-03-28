import { useRef, useState, useEffect } from 'react'
import { type MessageCircleContent } from '@/models/message'
import { getDataUrl } from '@/utils/getDataUrl'
import MessageCircleWaves from '../ui/MessageCircleWaves'
const SIZE = 160
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

export const MessageCircle: React.FC<{ content: MessageCircleContent }> = ({ content }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
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
    startMutedLoop()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      if (isSoundOn) {
        setProgress(video.currentTime / content.duration)
        setTimeDisplay(formatTime(content.duration - video.currentTime))
      }
    }

    const onEnded = () => {
      if (isSoundOn) {
        startMutedLoop()
      }
    }

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('ended', onEnded)
    }
  }, [isSoundOn, content.duration])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - SIZE / 2
    const y = e.clientY - rect.top - SIZE / 2
    const distance = Math.sqrt(x * x + y * y)

    if (distance < RADIUS - 15) {
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

    if (!content.duration) return
    const angle = Math.atan2(y, x)
    let normalized = angle + Math.PI / 2
    if (normalized < 0) normalized += 2 * Math.PI
    const percent = normalized / (2 * Math.PI)
    video.currentTime = percent * content.duration
  }

  const offset = CIRCUMFERENCE * (1 - progress)

  return (
    <div>
      <div className={`video-circle ${!isSoundOn ? 'paused' : ''}`} onClick={handleClick}>
        <video
          ref={videoRef}
          src={getDataUrl(content.content, 'video/mp4')}
          className="video-circle__video"
          playsInline
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

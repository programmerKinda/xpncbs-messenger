import { useEffect, useState } from 'react'
import { Download, LoaderCircle, Play } from 'lucide-react'
import { downloadVideo, getVideoPreviewMetadata } from '@/api/file'
import type { VideoLink } from '@/utils/video'
import { MessageText } from './MessageText'

interface VideoMetadata {
  title: string
  description?: string
  thumbnailUrl?: string
  durationSeconds?: number
  fileSizeBytes?: number
  qualityLabel?: string
}

interface YouTubeOEmbedMetadata {
  title?: string
  thumbnail_url?: string
}

const formatDuration = (durationSeconds: number) => {
  const hours = Math.floor(durationSeconds / 3600)
  const minutes = Math.floor((durationSeconds % 3600) / 60)
  const seconds = durationSeconds % 60
  const formattedMinutes = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes)

  return `${hours > 0 ? `${hours}:` : ''}${formattedMinutes}:${String(seconds).padStart(2, '0')}`
}

const formatFileSize = (size: number) => `${(size / (1024 * 1024)).toFixed(1)} MB`

function getEmbedUrl(video: VideoLink): string {
  if (video.provider === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`
  }

  const separator = video.id.lastIndexOf('_')
  const ownerId = video.id.slice(0, separator)
  const videoId = video.id.slice(separator + 1)
  return `https://vkvideo.ru/video_ext.php?oid=${encodeURIComponent(ownerId)}&id=${encodeURIComponent(videoId)}`
}

export default function VideoPreview({ video }: { video: VideoLink }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [thumbnailSize, setThumbnailSize] = useState<'maxresdefault' | 'hqdefault'>('maxresdefault')
  const [thumbnailAvailable, setThumbnailAvailable] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const providerLabel = video.provider === 'youtube' ? 'YouTube' : 'VK Видео'

  useEffect(() => {
    const abortController = new AbortController()
    const metadataRequest = getVideoPreviewMetadata(
      video.provider,
      video.id,
      abortController.signal
    ).catch(() => null)
    const oEmbedRequest =
      video.provider === 'youtube'
        ? fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${video.id}`)}&format=json`,
            { signal: abortController.signal }
          )
            .then((response) =>
              response.ok ? (response.json() as Promise<YouTubeOEmbedMetadata>) : null
            )
            .catch(() => null)
        : Promise.resolve(null)

    void Promise.all([metadataRequest, oEmbedRequest]).then(([data, oEmbed]) => {
      if (abortController.signal.aborted || (!data && !oEmbed)) return
      setMetadata({
        title: data?.title ?? oEmbed?.title ?? `Видео ${providerLabel}`,
        description: data?.description,
        thumbnailUrl: data?.thumbnailUrl ?? oEmbed?.thumbnail_url,
        durationSeconds: data?.durationSeconds,
        fileSizeBytes: data?.fileSizeBytes,
        qualityLabel: data?.qualityLabel,
      })
    })

    return () => abortController.abort()
  }, [video.id, video.provider, providerLabel])

  const handleThumbnailError = () => {
    if (video.provider === 'youtube' && thumbnailSize === 'maxresdefault') {
      setThumbnailSize('hqdefault')
    } else {
      setThumbnailAvailable(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadError(null)

    try {
      const { downloadUrl } = await downloadVideo(video.provider, video.id)
      const link = document.createElement('a')
      link.href = downloadUrl
      document.body.append(link)
      link.click()
      link.remove()
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Не удалось скачать видео')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <article className="message-video-preview">
      <div className="message-video-preview__info">
        <span className="message-video-preview__source">{providerLabel}</span>
        <strong>{metadata?.title ?? `Видео ${providerLabel}`}</strong>
        {metadata?.description && (
          <div className="message-video-preview__video-description">
            <MessageText content={metadata.description} embedYouTubeLinks={false} />
          </div>
        )}
      </div>
      <div className="message-video-preview__media">
        {isPlaying ? (
          <iframe
            src={getEmbedUrl(video)}
            title={metadata?.title ?? `Видео ${providerLabel}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <>
            {thumbnailAvailable && metadata?.thumbnailUrl && (
              <img
                src={
                  video.provider === 'youtube'
                    ? thumbnailSize === 'maxresdefault'
                      ? `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`
                      : (metadata.thumbnailUrl ??
                        `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`)
                    : metadata.thumbnailUrl
                }
                alt={`Превью видео ${providerLabel}`}
                loading="lazy"
                onError={handleThumbnailError}
              />
            )}
            <button
              className="message-video-preview__badge"
              type="button"
              aria-label={
                isDownloading
                  ? `Скачивание видео ${providerLabel}`
                  : `Скачать видео ${providerLabel}, ${metadata?.fileSizeBytes ? formatFileSize(metadata.fileSizeBytes) : 'размер недоступен'}`
              }
              title={downloadError ?? 'Скачать видео'}
              disabled={isDownloading}
              onClick={() => void handleDownload()}
            >
              {isDownloading ? (
                <LoaderCircle size={17} className="message-video-preview__download-spinner" />
              ) : (
                <Download size={17} />
              )}
              <span>
                {metadata?.durationSeconds ? formatDuration(metadata.durationSeconds) : 'Видео'}
                <br />
                {metadata?.fileSizeBytes
                  ? formatFileSize(metadata.fileSizeBytes)
                  : 'Размер недоступен'}
              </span>
            </button>
            <button
              className="message-video-preview__play"
              type="button"
              aria-label={`Воспроизвести видео ${providerLabel}`}
              onClick={() => setIsPlaying(true)}
            >
              <Play size={27} fill="currentColor" strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>
      {downloadError && (
        <div className="message-video-preview__download-error" role="alert">
          {downloadError}
        </div>
      )}
    </article>
  )
}

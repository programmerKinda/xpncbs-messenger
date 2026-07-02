import { useEffect, useState } from 'react'
import { File as FileIcon } from 'lucide-react'
import { isPhotoOrVideoFile } from '@/hooks/useChatWindowController'

interface ChatFileSendModalProps {
  files: File[]
}

function getFileExtension(file: File) {
  const extension = file.name.split('.').pop() || ''
  return extension.toUpperCase()
}

function FilePreview({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const isPreviewable = isPhotoOrVideoFile(file)
  const isImage =
    file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file.name)
  const isVideo =
    file.type.startsWith('video/') ||
    /\.(mp4|mov|avi|mkv|webm|m4v|wmv|flv|3gp|mpeg|mpg)$/i.test(file.name)
  const extension = getFileExtension(file)

  useEffect(() => {
    let canceled = false

    if (isImage) {
      const reader = new FileReader()
      reader.onload = () => {
        if (!canceled) {
          setPreviewUrl(reader.result as string)
        }
      }
      reader.readAsDataURL(file)

      return () => {
        canceled = true
        reader.abort()
      }
    }

    if (isVideo) {
      const objectUrl = URL.createObjectURL(file)
      const video = document.createElement('video')
      const cleanup = () => {
        video.pause()
        video.src = ''
        URL.revokeObjectURL(objectUrl)
      }

      const handleLoadedData = () => {
        if (canceled) return
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 160
        canvas.height = video.videoHeight || 90
        const context = canvas.getContext('2d')
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          setPreviewUrl(canvas.toDataURL('image/jpeg'))
        }
      }

      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true
      video.addEventListener('loadeddata', handleLoadedData)
      video.src = objectUrl
      video.load()

      return () => {
        canceled = true
        video.removeEventListener('loadeddata', handleLoadedData)
        cleanup()
      }
    }

    return undefined
  }, [file, isImage, isVideo])

  if (isPreviewable && previewUrl) {
    return <img className="file-icon-img" src={previewUrl} alt={file.name} />
  }

  return (
    <>
      <FileIcon size={32} />
      <span className="file-icon-extension">{extension}</span>
    </>
  )
}

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function ChatFileSendModal({ files }: ChatFileSendModalProps) {
  return (
    <div className="chat-file-send-modal">
      <div className="modal__content-body">
        {files.map((file, index) => (
          <div className="file-item" key={index}>
            <div className="file-icon">
              <FilePreview file={file} />
            </div>

            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-size">{formatFileSize(file.size)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="modal__content-footer"></div>
    </div>
  )
}

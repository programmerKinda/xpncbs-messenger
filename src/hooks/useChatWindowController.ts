import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useChatMenuStore } from '@/controllers/chatMenuController'
import type { ChatInputHandle } from '@/views/chat/ChatInput'

const emojiLabels = {
  'Frequently Used': 'Часто используемые',
  'Custom Emojis': 'Пользовательские эмодзи',
  People: 'Люди',
  'Animals & Nature': 'Животные & природа',
  'Smileys & People': 'Смайлы & люди',
  'Food & Drink': 'Еда & напитки',
  'Travel & Places': 'Путешествия & места',
  Activities: 'Активности',
  Objects: 'Объекты',
  Symbols: 'Символы',
  Flags: 'Флаги',
} as const

const allowedExtensions = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'mp4',
  'mov',
  'avi',
  'mkv',
  'webm',
  'm4v',
  'wmv',
  'flv',
  '3gp',
  'mpeg',
  'mpg',
] as const

const hasPhotosOrVideosFromItems = (items: DataTransferItemList | null): boolean => {
  if (!items) return false

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    if (item.kind !== 'file') continue

    const mime = item.type
    if (mime && (mime.startsWith('image/') || mime.startsWith('video/'))) {
      return true
    }

    try {
      const file = item.getAsFile()
      if (file) {
        const ftype = file.type
        if (ftype && (ftype.startsWith('image/') || ftype.startsWith('video/'))) {
          return true
        }

        const name = file.name || ''
        if (name.match(/\.(png|jpe?g|webp|gif|mp4|mov|avi|mkv|webm|m4v|wmv|flv|3gp|mpeg|mpg)$/i)) {
          return true
        }
      }
    } catch {
      // ignore and continue
    }
  }

  return false
}

const checkAllowExtensions = (files: File[]): boolean => {
  if (!files || files.length === 0) return false

  return files.every((file) => {
    const checking = file.name.toLowerCase()
    return new RegExp(`(\\.${allowedExtensions.join('|\\.')})$`).test(checking)
  })
}

export function useChatWindowController() {
  const [isRecording, setIsRecording] = useState(false)
  const [value, setValue] = useState('')
  const [formRadius, setFormRadius] = useState('999px')
  const [isDragging, setIsDragging] = useState(false)
  const [hasPhotosOrVideos, setHasPhotosOrVideos] = useState(false)

  const chatInputRef = useRef<ChatInputHandle>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dragCounter = useRef(0)
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const { toggleMenu } = useChatMenuStore()

  useEffect(() => {
    const formElement = formRef.current
    if (!formElement) return

    const initialHeight = formElement.offsetHeight
    const maxHeight = initialHeight + 160
    const minRadius = 8
    const maxRadius = Math.round(initialHeight / 2)

    const updateRadius = () => {
      const height = formElement.offsetHeight
      const normalized = Math.min(
        1,
        Math.max(0, (height - initialHeight) / (maxHeight - initialHeight))
      )
      const radius = Math.round(maxRadius - normalized * (maxRadius - minRadius))
      setFormRadius(`${radius}px`)
    }

    updateRadius()
    const resizeObserver = new ResizeObserver(updateRadius)
    resizeObserver.observe(formElement)

    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    const updateEmojiLabels = () => {
      const labels = document.querySelectorAll<HTMLDivElement>('.epr-emoji-category-label')
      labels.forEach((el) => {
        if (!el.dataset.key) {
          el.dataset.key = el.textContent ?? ''
        }

        const key = el.dataset.key as keyof typeof emojiLabels
        const translated = emojiLabels[key]

        if (translated !== undefined && el.textContent !== translated) {
          el.textContent = translated
        }
      })
    }

    const observer = new MutationObserver(() => {
      const picker = document.querySelector('.EmojiPickerReact')

      if (picker) {
        updateEmojiLabels()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [])

  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault()
    dragCounter.current += 1

    if (!event.dataTransfer.types.includes('Files')) return

    setIsDragging(true)
    setHasPhotosOrVideos(hasPhotosOrVideosFromItems(event.dataTransfer.items))
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    dragCounter.current -= 1

    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()

    dragCounter.current = 0
    setIsDragging(false)

    const files = [...event.dataTransfer.files]
    if (checkAllowExtensions(files)) {
      console.log(files, hasPhotosOrVideos)
    }
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
  }

  const handleToggleRecording = () => {
    setIsRecording((prev) => !prev)
  }

  const handleEmojiSelect = (emoji: string) => {
    chatInputRef.current?.insertEmojiAtCaret(emoji)
  }

  return {
    isRecording,
    setIsRecording,
    value,
    setValue,
    formRadius,
    chatInputRef,
    formRef,
    isDragging,
    hasPhotosOrVideos,
    chatWindowRef,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragOver,
    toggleMenu,
    handleToggleRecording,
    handleEmojiSelect,
  } as const
}

export type UseChatWindowControllerResult = ReturnType<typeof useChatWindowController>

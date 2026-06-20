import Menu from '@/shared/components/menu'
import VoiceRecorder from './VoiceRecorder'

import {
  Plus,
  Sticker,
  Mic,
  EllipsisVertical,
  FileText,
  Image,
  Headphones,
  Send,
  Trash,
} from 'lucide-react'
import { PopupProvider } from '@/shared/components/PopupProvider'
import { User, Settings, LogOut } from 'lucide-react'
import Message from '../message/Message'
import UserAvatar from '../user/UserAvatar'
import UserName from '../user/UserName'
import EmojiPicker from 'emoji-picker-react'
import { useState, useRef, useEffect } from 'react'
import ChatInput, { type ChatInputHandle } from './ChatInput'
export default function ChatWindow() {
  const [isRecording, setIsRecording] = useState(false)
  const [value, setValue] = useState('')
  const [formRadius, setFormRadius] = useState('999px')
  const chatInputRef = useRef<ChatInputHandle>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hasPhotosOrVideos, setHasPhotosOrVideos] = useState(false)

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
  }

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

const dragCounter = useRef(0);

const handleDragEnter = (e: React.DragEvent) => {
  e.preventDefault();
  dragCounter.current++;

  if (e.dataTransfer.types.includes('Files')) {
    setIsDragging(true);
  }
  setHasPhotosOrVideos(checkAllowExtensions([...e.dataTransfer.items].filter(item => item.kind === 'file').map(item => item.getAsFile()!).filter(file => file !== null) as File[]));
};

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  dragCounter.current--;

  if (dragCounter.current === 0) {
    setIsDragging(false);
  }
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();

  dragCounter.current = 0;
  setIsDragging(false);

  const files = [...e.dataTransfer.files];
  if (checkAllowExtensions(files)) {
    console.log(files,hasPhotosOrVideos);
  }
};
const checkAllowExtensions = (files: File[]): boolean => {
  const allowedExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.gif',
    '.mp4',
    '.mov',
    '.avi',
    '.mkv',
    '.webm',
    '.m4v',
    '.wmv',
    '.flv',
    '.3gp',
    '.mpeg',
    '.mpg',
  ];

  for (const file of files) {
    const fileName = file.name.toLowerCase();

    if (
      !allowedExtensions.find(ext => fileName.endsWith(ext))
    ) {
      setHasPhotosOrVideos(false); // Return the current state if any file has an unsupported extension
    }
  }

  setHasPhotosOrVideos(true);
};
  return (
    <div className="chat-window" style={{ background: `url('images/chatBg.jpeg')` }}    onDragEnter={handleDragEnter}
  onDragLeave={handleDragLeave}
  onDragOver={(e) => e.preventDefault()}>
      <header className="chat-window__header">
        <div className="flex gap-1 items-start">
          <UserAvatar name="x p" avatarURL="" />
          <UserName name="" phone="123-456-7890" contactName="" />
        </div>

        <PopupProvider
          placement="bottom"
          align="center"
          popup={
            <Menu
              items={[
                {
                  icon: <User />,
                  label: 'Профиль',
                  onClick: () => console.log('Профиль'),
                },
                {
                  icon: <Settings />,
                  label: 'Настройки',
                  onClick: () => console.log('Настройки'),
                },
                {
                  icon: <LogOut />,
                  label: 'Выход',
                  onClick: () => console.log('Выход'),
                },
              ]}
            />
          }
        >
          <button>
            <EllipsisVertical />
          </button>
        </PopupProvider>
      </header>
      <div className="chat-window__body">
        <Message
          message={{
            uuid: '1',
            type: 'text',
            content: 'Привет, как дела?',
            createdAt: new Date(),
            updated: false,
            watched: false,
          }}
        />
      </div>
      <footer className="chat-window__footer">
        <form
          action=""
          className="chat-window__form"
          ref={formRef}
          style={{ borderRadius: formRadius, transition: 'border-radius 1s ease' }}
        >
          <div className="chat-window__label">
          {!isRecording ?(<>            <PopupProvider
              placement="top"
              align="center"
              popup={
                <Menu
                  items={[
                    {
                      icon: <FileText />,
                      label: 'Документ',
                      onClick: () => console.log('Документ'),
                    },
                    {
                      icon: <Image />,
                      label: 'Фото и видео',
                      onClick: () => console.log('Фото и видео'),
                    },
                    {
                      icon: <Headphones />,
                      label: 'Аудио',
                      onClick: () => console.log('Аудио'),
                    },
                    {
                      icon: <User />,
                      label: 'Контакт',
                      onClick: () => console.log('Контакт'),
                    },
                  ]}
                /> 
              }
            >
              <button type="button">
                <Plus size={25} />
              </button>
            </PopupProvider>
            <PopupProvider
              placement="top"
              align="center"
              popup={
                <><style>
                  {`.epr_-3yva2a{display: none !important;}`}
                </style>
                <EmojiPicker
                  style={{ border: 'none',background: 'none',width: '500px',height: '350px' }}
                  
                  searchDisabled
                  onEmojiClick={(emojiObject) => {
                    chatInputRef.current?.insertEmojiAtCaret(emojiObject.emoji)
                    // setValue((prev) => prev + emojiObject.emoji)
                  }} 
                /></>
              }
            >
              <button type="button">
                <Sticker size={25} />
              </button>
            </PopupProvider></>) : <Trash size={25} onClick={() => setIsRecording(false)} />}
            {/* <input type="text" className="chat-window__input" value={value} placeholder="Введите сообщение" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}/> */}
            {!isRecording && (
              <ChatInput
                ref={chatInputRef}
                value={value}
                setValue={setValue}
                placeholder="Введите сообщение"
              />
            )}
            {isRecording && <VoiceRecorder isRecording={isRecording} />}
            
            <button type="button" onClick={() => setIsRecording(!isRecording)}>
              {value.trim()  === '' && !isRecording ? <Mic size={25}  /> : <Send size={25} />}
            </button>
          </div>
          
        </form>
      </footer>
      {isDragging && (
        <div className='chat-window__drop-area' onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
          <div className='chat-window__drop-text'>
            <span className='chat-window__drop-text--primary'>Перетащите файлы сюда</span>
            <span className='chat-window__drop-text--secondary'>для отправки без сжатия</span>
          </div>
        {hasPhotosOrVideos && (          <div className='chat-window__drop-text'>
            <span className='chat-window__drop-text--primary'>Перетащите файлы сюда</span>
            <span className='chat-window__drop-text--secondary'>для быстрой отправки</span>
          </div>)}
        </div>)}
      
    </div>
  )
}

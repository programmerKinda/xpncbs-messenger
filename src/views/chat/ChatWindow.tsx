import Menu from '@/shared/components/menu'
import {
  Plus,
  Sticker,
  Mic,
  EllipsisVertical,
  FileText,
  Image,
  Headphones,
  Send,
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
  const [value, setValue] = useState('')
  const [formRadius, setFormRadius] = useState('999px')
  const chatInputRef = useRef<ChatInputHandle>(null)
  const formRef = useRef<HTMLFormElement>(null)

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

  return (
    <div className="chat-window" style={{ background: `url('images/chatBg.jpeg')` }}>
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
            <PopupProvider
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
                <EmojiPicker
                  searchDisabled
                  onEmojiClick={(emojiObject) => {
                    chatInputRef.current?.insertEmojiAtCaret(emojiObject.emoji)
                    // setValue((prev) => prev + emojiObject.emoji)
                  }}
                />
              }
            >
              <button type="button">
                <Sticker size={25} />
              </button>
            </PopupProvider>
            {/* <input type="text" className="chat-window__input" value={value} placeholder="Введите сообщение" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}/> */}
            <ChatInput
              ref={chatInputRef}
              value={value}
              setValue={setValue}
              placeholder="Введите сообщение"
            />
            <button type="button">
              {value.trim() === '' ? <Mic size={25} /> : <Send size={25} />}
            </button>
          </div>
        </form>
      </footer>
    </div>
  )
}

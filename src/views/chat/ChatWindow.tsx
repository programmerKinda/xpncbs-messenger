import Menu from '@/shared/components/menu'
import { Plus, Sticker, Mic, EllipsisVertical, FileText, Image, Headphones } from 'lucide-react'
import { PopupProvider } from '@/shared/components/PopupProvider'
import { User, Settings, LogOut } from 'lucide-react'
import Message from '../message/Message'
import UserAvatar from '../user/UserAvatar'
import UserName from '../user/UserName'
import EmojiPicker from 'emoji-picker-react'
import { useState } from 'react'
import ChatInput from './ChatInput'
export default function ChatWindow() {
  const [value, setValue] = useState('')
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
        <form action="" className="chat-window__form">
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
                  onEmojiClick={(emojiObject) => setValue((prev) => prev + emojiObject.emoji)}
                />
              }
            >
              <button type="button">
                <Sticker size={25} />
              </button>
            </PopupProvider>
            {/* <input type="text" className="chat-window__input" value={value} placeholder="Введите сообщение" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}/> */}
            <ChatInput value={value} setValue={setValue} placeholder="Введите сообщение" />
            <button type="button">
              <Mic size={25} />
            </button>
          </div>
        </form>
      </footer>
    </div>
  )
}

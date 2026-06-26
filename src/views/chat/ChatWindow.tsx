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
import ChatInput from './ChatInput'
import { useChatWindowController } from '@/hooks/useChatWindowController'

export default function ChatWindow() {
  const {
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
  } = useChatWindowController()

  return (
    <div
      className="chat-window"
      style={{ background: `url('images/chatBg.jpeg')` }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      ref={chatWindowRef}
    >
      <header className="chat-window__header">
        <div className="flex gap-1 items-start">
          <UserAvatar name="x p" avatarURL="" />

                    <div onClick={toggleMenu}>
            <UserName name="" phone="123-456-7890" contactName="" />
          </div>
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
          {!isRecording && (<>            <PopupProvider
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
                  style={{ border: 'none', background: 'none', width: '500px', height: '350px' }}
                  searchDisabled
                  onEmojiClick={(emojiObject) => handleEmojiSelect(emojiObject.emoji)}
                /></>
              }
            >
              <button type="button">
                <Sticker size={25} />
              </button>
            </PopupProvider></>)}
            {/* <input type="text" className="chat-window__input" value={value} placeholder="Введите сообщение" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}/> */}
            {!isRecording && (
              <ChatInput
                ref={chatInputRef}
                value={value}
                setValue={setValue}
                placeholder="Введите сообщение"
              />
            )}
            {isRecording && (
              <div className="flex justify-end items-center gap-2 w-full">
                <Trash size={25} onClick={() => setIsRecording(false)} />
                <VoiceRecorder isRecording={isRecording} />
              </div>
            )}
            <button type="button" onClick={handleToggleRecording}>
              {value.trim() === '' && !isRecording ? <Mic size={25} /> : <Send size={25} />}
            </button>
          </div>
          
        </form>
      </footer>
{isDragging && (
  <div
    className="chat-window__drop-area"
    onDrop={handleDrop}
    onDragOver={(e) => e.preventDefault()}
  >
    {hasPhotosOrVideos ? (
      <>
        <div className="chat-window__drop-text">
          <span className="chat-window__drop-text--primary">
            Перетащите фотографии сюда
          </span>
          <span className="chat-window__drop-text--secondary">
            для отправки без сжатия
          </span>
        </div>

        <div className="chat-window__drop-text">
          <span className="chat-window__drop-text--primary">
            Перетащите фотографии сюда
          </span>
          <span className="chat-window__drop-text--secondary">
            для быстрой отправки
          </span>
        </div>
      </>
    ) : (
      <div className="chat-window__drop-text">
        <span className="chat-window__drop-text--primary">
          Перетащите файл сюда
        </span>
        <span className="chat-window__drop-text--secondary">
          для отправки
        </span>
      </div>
    )}
  </div>
)}
</div>)}
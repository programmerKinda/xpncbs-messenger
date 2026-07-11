import Menu from '@/shared/components/menu'

import ChatFileSendModal from './ChatFileSendModal'

import { Plus, EllipsisVertical } from 'lucide-react'
import { PopupProvider } from '@/shared/components/PopupProvider'
import { User, Settings, LogOut } from 'lucide-react'
import Message from '../message/Message'
import UserAvatar from '../user/UserAvatar'
import UserName from '../user/UserName'

import { useChatWindowController } from '@/hooks/useChatWindowController'
import { useModalStore } from '@/controllers/modalController'
import ChatForm from './ChatForm'

export default function ChatWindow() {
  const { setModalChildren, setModalHeaderContent } = useModalStore()
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
    draggedFiles,
    setDraggedFiles,
  } = useChatWindowController()

  const openFileSendModal = (files: File[]) => {
    setModalChildren(
      <>
        <ChatFileSendModal files={files} />
      </>
    )
    setModalHeaderContent(
      <div className="flex w-full justify-between">
        <span>Отправить {files.length} файлов</span>
        <button
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.multiple = true
            input.onchange = () => {
              const selectedFiles = Array.from(input.files ?? [])
              if (selectedFiles.length === 0) {
                input.remove()
                return
              }

              setDraggedFiles((prev) => {
                const nextFiles = [...prev, ...selectedFiles]
                openFileSendModal(nextFiles)
                return nextFiles
              })
              input.remove()
            }

            input.click()
          }}
        >
          <Plus />
        </button>
      </div>
    )
  }

  return (
    <div
      className="chat-window"
      style={{ backgroundColor: '#c4c7dd8a' }}
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
        className="message--outgoing"
          message={{
            uuid: '1',
            type: 'text',
            content: 'Привет, как дела?',
            createdAt: new Date(),
            updated: false,
            watched: false,
            
          }}
        />
                <Message
          className="message--incoming"
          message={{
            uuid: '2',
            type: 'text',
            content: 'Привет, как дела?',
            createdAt: new Date(),
            updated: false,
            watched: true,
          }}
        />
      </div>
      <footer className="chat-window__footer">
        
          <ChatForm
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            value={value}
            setValue={setValue}
          formRadius={formRadius}
          formRef={formRef}
          chatInputRef={chatInputRef}
          handleToggleRecording={handleToggleRecording}
          handleEmojiSelect={handleEmojiSelect}
          addFileButton={true}
          voiceButton={true}
        />
        
      </footer>

      {isDragging && (
        <div
          className="chat-window__drop-area"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {hasPhotosOrVideos ? (
            <>
              <div
                className="chat-window__drop-text"
                onDrop={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  const files = [...event.dataTransfer.files]
                  handleDrop(event)
                  openFileSendModal(files)
                }}
              >
                <span className="chat-window__drop-text--primary">Перетащите фотографии сюда</span>
                <span className="chat-window__drop-text--secondary">для отправки без сжатия</span>
              </div>

              <div
                className="chat-window__drop-text"
                onDrop={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  const files = [...event.dataTransfer.files]
                  handleDrop(event)
                  openFileSendModal(files)
                }}
              >
                <span className="chat-window__drop-text--primary">Перетащите фотографии сюда</span>
                <span className="chat-window__drop-text--secondary">для быстрой отправки</span>
              </div>
            </>
          ) : (
            <div
              className="chat-window__drop-text"
              onDrop={(event) => {
                event.preventDefault()
                event.stopPropagation()
                const files = [...event.dataTransfer.files]
                handleDrop(event)
                openFileSendModal(files)
              }}
            >
              <span className="chat-window__drop-text--primary">Перетащите файл сюда</span>
              <span className="chat-window__drop-text--secondary">для отправки</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

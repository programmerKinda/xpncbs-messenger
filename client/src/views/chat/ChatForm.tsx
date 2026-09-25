import { useState } from 'react'
import Menu from '@/shared/components/menu'
import { PopupProvider } from '@/shared/components/PopupProvider'
import ChatInput from './ChatInput'
import type { ChatInputHandle } from './ChatInput'
import VoiceRecorder from './VoiceRecorder'
import CircleRecorder from './CircleRecorder'

import { Plus, Sticker, Mic, Send, Trash, FileText, Image, Headphones, User, Video } from 'lucide-react'

import EmojiPicker from 'emoji-picker-react'

interface ChatFormProps {
  isRecording: boolean
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>

  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>

  formRadius: string | number

  formRef: React.RefObject<HTMLFormElement | null>
  chatInputRef: React.RefObject<ChatInputHandle | null>

  handleToggleRecording: () => void
  handleEmojiSelect: (emoji: string) => void
  addFileButton: boolean
  voiceButton: boolean
  onSend?: () => void | Promise<void>
  onVoiceRecorded?: (blob: Blob, duration: number, waveform: number[]) => void | Promise<void>
  onCircleRecorded?: (blob: Blob, duration: number) => void | Promise<void>
}

export default function ChatForm({
  isRecording,
  setIsRecording,
  value,
  setValue,
  formRadius,
  formRef,
  chatInputRef,
  handleToggleRecording,
  handleEmojiSelect,
  addFileButton,
  voiceButton,
  onSend,
  onVoiceRecorded,
  onCircleRecorded,
}: ChatFormProps) {
  const [discardRecording, setDiscardRecording] = useState(false)
  const [isCircleRecording, setIsCircleRecording] = useState(false)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSend?.()
  }

  const handleAction = () => {
    if (value.trim() && onSend) {
      setDiscardRecording(false)
      void onSend()
      return
    }

    setDiscardRecording(false)
    handleToggleRecording()
  }

  return (
    <form
      className="chat-window__form"
      ref={formRef}
      onSubmit={handleSubmit}
      style={{
        borderRadius: formRadius,
        transition: 'border-radius 1s ease',
      }}
    >
      <div className="chat-window__label">
        {!isRecording && (
          <>
            {addFileButton && (
              <PopupProvider
                placement="top"
                align="center"
                popup={
                  <Menu
                    items={[
                      {
                        icon: <FileText />,
                        label: 'Документ',
                        onClick: () => {},
                      },
                      {
                        icon: <Image />,
                        label: 'Фото и видео',
                        onClick: () => {},
                      },
                      {
                        icon: <Headphones />,
                        label: 'Аудио',
                        onClick: () => {},
                      },
                      {
                        icon: <User />,
                        label: 'Контакт',
                        onClick: () => {},
                      },
                    ]}
                  />
                }
              >
                <button type="button">
                  <Plus size={25} color={'#6B7280'} />
                </button>
              </PopupProvider>
            )}

            <PopupProvider
              placement="top"
              align="center"
              popup={
                <>
                  <style>{`.epr_-3yva2a{display:none !important;}`}</style>

                  <EmojiPicker
                    searchDisabled
                    style={{
                      border: 'none',
                      background: 'none',
                      width: 500,
                      height: 350,
                    }}
                    onEmojiClick={(e) => handleEmojiSelect(e.emoji)}
                  />
                </>
              }
            >
              <button type="button">
                <Sticker size={25} color={'#6B7280'} />
              </button>
            </PopupProvider>

            <ChatInput
              ref={chatInputRef}
              value={value}
              setValue={setValue}
              placeholder="Введите сообщение"
              onEnter={() => {
                if (value.trim() && onSend) void onSend()
              }}
            />
            <button
              type="button"
              aria-label={isCircleRecording ? 'Остановить запись кружочка' : 'Записать кружочек'}
              onClick={() => setIsCircleRecording((current) => !current)}
            >
              <Video size={24} color="#6B7280" />
            </button>
          </>
        )}
        <CircleRecorder
          isRecording={isCircleRecording}
          onRecordingComplete={(blob, duration) => {
            setIsCircleRecording(false)
            void onCircleRecorded?.(blob, duration)
          }}
          onRecordingError={() => setIsCircleRecording(false)}
          onStopRecording={() => setIsCircleRecording(false)}
        />
        {voiceButton ? (
          <>
            {isRecording && (
              <div className="flex justify-end items-center gap-2 w-full">
                <Trash
                  size={25}
                  onClick={() => {
                    setDiscardRecording(true)
                    setIsRecording(false)
                  }}
                />
                <VoiceRecorder
                  isRecording={isRecording}
                  discard={discardRecording}
                  onRecordingComplete={onVoiceRecorded}
                />
              </div>
            )}

            <button type="button" onClick={handleAction}>
              {value.trim() === '' && !isRecording ? (
                <Mic size={25} color={'#6B7280'} />
              ) : (
                <Send size={25} color={'#6B7280'} />
              )}
            </button>
          </>
        ) : (
          <button type="submit">
            <Send size={25} color={'#6B7280'} />
          </button>
        )}
      </div>
    </form>
  )
}

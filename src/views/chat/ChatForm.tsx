import Menu from '@/shared/components/menu'
import { PopupProvider } from '@/shared/components/PopupProvider'
import ChatInput from './ChatInput'
import VoiceRecorder from './VoiceRecorder'

import { Plus, Sticker, Mic, Send, Trash, FileText, Image, Headphones, User } from 'lucide-react'

import EmojiPicker from 'emoji-picker-react'

interface ChatFormProps {
  isRecording: boolean
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>

  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>

  formRadius: string | number

  formRef: React.RefObject<HTMLFormElement | null>
  chatInputRef: React.RefObject<any>

  handleToggleRecording: () => void
  handleEmojiSelect: (emoji: string) => void
  addFileButton: boolean
  voiceButton: boolean
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
}: ChatFormProps) {
  return (
    <form
      className="chat-window__form"
      ref={formRef}
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
                  <Plus size={25} />
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
                <Sticker size={25} />
              </button>
            </PopupProvider>

            <ChatInput
              ref={chatInputRef}
              value={value}
              setValue={setValue}
              placeholder="Введите сообщение"
            />
          </>
        )}
{voiceButton ? (
  <>
    {isRecording && (
      <div className="flex justify-end items-center gap-2 w-full">
        <Trash size={25} onClick={() => setIsRecording(false)} />
        <VoiceRecorder isRecording={isRecording} />
      </div>
    )}

    <button type="button" onClick={handleToggleRecording}>
      {value.trim() === "" && !isRecording ? (
        <Mic size={25} />
      ) : (
        <Send size={25} />
      )}
    </button>
  </>
) : (
  <button type="submit">
    <Send size={25} />
  </button>
)}
      </div>
    </form>
  )
}

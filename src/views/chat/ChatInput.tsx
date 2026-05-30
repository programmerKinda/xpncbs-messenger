import { useRef, useEffect, useState } from 'react'

interface ChatInputProps {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
  placeholder?: string
}

const ChatInput = ({ value, setValue, placeholder }: ChatInputProps) => {
  const [isEmpty, setIsEmpty] = useState(true)
  function emojiToUnified(emoji: string): string {
    return [...emoji]
      .map((char) => char.codePointAt(0)?.toString(16))
      .filter(Boolean)
      .join('-')
  }

  const inputRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = inputRef.current

    if (!el) return

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        setIsEmpty(el.textContent?.trim() === '' && el.querySelectorAll('img').length === 0)
      })
    })

    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [])
  const handleInput = () => {
    inputRef.current!.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const currentContent = node.textContent as string
        const segmenter = new Intl.Segmenter(undefined, {
          granularity: 'grapheme',
        })

        const parts = [...segmenter.segment(currentContent)].map((s) => s.segment)

        const result = parts.map((item) => ({
          type: /\p{Extended_Pictographic}/u.test(item) ? 'emoji' : 'text',
          content: item,
        }))
        node.textContent = ''

        result.forEach((item) => {
          if (item.type === 'text') {
            const span = document.createElement('span')
            span.textContent = item.content
            inputRef.current!.appendChild(span)
          }
          if (item.type === 'emoji') {
            const img = document.createElement('img')
            img.src = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emojiToUnified(
              item.content
            )}.png`
            img.alt = item.content
            img.className = 'emoji'
            inputRef.current!.appendChild(img)
          }
        })
      }
    })
  }
  return (
    <div className="chat-kinda-input">
      <div
        className="chat-kinda-input__content"
        contentEditable
        tabIndex={0}
        ref={inputRef}
        onClick={() => console.log(value)}
        onInput={handleInput}
      ></div>
      {isEmpty && <span className="chat-kinda-placeholder">{placeholder}</span>}
    </div>
  )
}
export default ChatInput

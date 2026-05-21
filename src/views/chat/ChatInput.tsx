import { useLayoutEffect, useRef,useEffect } from 'react'
interface ChatInputProps {
  value: string
  setValue: (value: string) => void
  placeholder?: string
}

const ChatInput = ({ value, setValue, placeholder }: ChatInputProps) => {
  const text = 'dsl;,dvsl,sdlsdds😕dddd🤨'

  const parts: string[] =
    text.match(
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}]|[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+/gu
    ) ?? []

  const result = parts.map((item) => ({
    type: /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(item) ? 'emoji' : 'text',
    content: item,
  }))
  console.log(result)
  function emojiToUnified(emoji: string): string {
    return [...emoji]
      .map((char) => char.codePointAt(0)?.toString(16))
      .filter(Boolean)
      .join('-')
  }

  console.log(emojiToUnified('😄')) // 1f604
  console.log(emojiToUnified('🤨')) // 1f928
  console.log(emojiToUnified('👨👩👧👦')) // 1f468-200d-1f469-200d-1f467-200d-1f466
  const inputRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = inputRef.current

    if (!el) {
      return
    }


    const selection = window.getSelection()

    let cursorPosition = 0

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const preCaretRange = range.cloneRange()

      preCaretRange.selectNodeContents(el)
      preCaretRange.setEnd(range.endContainer, range.endOffset)

      cursorPosition = preCaretRange.toString().length
    }

    el.innerHTML = ''

    const parts =
      value.match(
        /[\p{Emoji_Presentation}\p{Extended_Pictographic}]|[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+/gu
      ) ?? []

    const result = parts.map((item) => ({
      type: /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(item) ? 'emoji' : 'text',
      content: item,
    }))

    result.forEach((item) => {
      const span = document.createElement('span')

      if (item.type === 'text') {
        span.innerText = item.content
      }

      if (item.type === 'emoji') {
        const classes = [
          'relative',
          'inline-block',
          "before:content-['']",
          'text-transparent',
          'before:absolute',
          'before:inset-0',
          'before:bg-[image:var(--emoji-url)]',
          'before:bg-contain',
          'before:bg-center',
          'before:bg-no-repeat',
        ]

        classes.forEach((className) => {
          span.classList.add(className)
        })

        span.style.setProperty(
          '--emoji-url',
          `url('https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emojiToUnified(item.content)}.png')`
        )

        span.innerText = item.content
      }

      el.appendChild(span)
    })

    if (!selection) {
      return
    }

    const range = document.createRange()

    let currentPosition = 0

    const walk = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length ?? 0

        if (currentPosition + textLength >= cursorPosition) {
          range.setStart(node, cursorPosition - currentPosition)
          range.collapse(true)

          return true
        }

        currentPosition += textLength
      }

      for (const child of node.childNodes) {
        if (walk(child)) {
          return true
        }
      }

      return false
    }

    walk(el)

    selection.removeAllRanges()
    selection.addRange(range)
  }, [value])
  useEffect(() => {inputRef.current?.focus()}, [value])
  return (
    <div className="chat-kinda-input">
    <div
      className="chat-kinda-input__content"
      contentEditable
      tabIndex={0}
      ref={inputRef}
      onInput={(e) => setValue(e.currentTarget.textContent)}
      
    >
     
    </div>
    {inputRef.current?.textContent === '' && (
      <span className="chat-kinda-placeholder">{placeholder}</span>
    )}
  </div>
  )
}
export default ChatInput

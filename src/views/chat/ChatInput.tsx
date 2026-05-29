import { useLayoutEffect, useRef, useEffect } from 'react'

interface ChatInputProps {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
  placeholder?: string
}

const ChatInput = ({ value, setValue, placeholder }: ChatInputProps) => {
  function emojiToUnified(emoji: string): string {
    return [...emoji]
      .map((char) => char.codePointAt(0)?.toString(16))
      .filter(Boolean)
      .join('-')
  }

  const inputRef = useRef<HTMLDivElement>(null)
  // useLayoutEffect(() => {
  //   const el = inputRef.current

  //   if (!el) {
  //     return
  //   }

  //   const selection = window.getSelection()

  //   let cursorPosition = 0

  //   // сохраняем позицию курсора
  //   if (selection && selection.rangeCount > 0) {
  //     const range = selection.getRangeAt(0)
  //     const preCaretRange = range.cloneRange()

  //     preCaretRange.selectNodeContents(el)
  //     preCaretRange.setEnd(range.endContainer, range.endOffset)

  //     cursorPosition = preCaretRange.toString().length
  //   }

  //   // очищаем
  //   el.innerHTML = ''

  //   // корректная сегментация grapheme clusters
  //   const segmenter = new Intl.Segmenter(undefined, {
  //     granularity: 'grapheme',
  //   })

  //   const parts = [...segmenter.segment(value)].map((s) => s.segment)

  //   const result = parts.map((item) => ({
  //     type: /\p{Extended_Pictographic}/u.test(item) ? 'emoji' : 'text',
  //     content: item,
  //   }))

  //   result.forEach((item) => {

  //     // обычный текст
  //     if (item.type === 'text') {
  //       const span = document.createElement('span')
  //       span.classList.add("input-text")
  //       span.textContent = item.content
  //       el.appendChild(span)
  //     }

  //     // emoji
  //     if (item.type === 'emoji') {
  //       const img = document.createElement('img')
  //       img.src = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emojiToUnified(
  //         item.content
  //       )}.png`
  //       img.alt = item.content

  //         img.classList.add("emoji")

  //       // нужен реальный текст внутри для caret/selection
  //       el.appendChild(img)
  //     }

  //   })

  //   // восстанавливаем курсор
  //   if (!selection) {
  //     return
  //   }

  //   const range = document.createRange()

  //   let currentPosition = 0

  //   const walk = (node: Node): boolean => {
  //     if (node.nodeType === Node.TEXT_NODE) {
  //       const text = node.textContent ?? ''
  //       const textLength = text.length

  //       if (currentPosition + textLength >= cursorPosition) {
  //         range.setStart(node, cursorPosition - currentPosition)
  //         range.collapse(true)

  //         return true
  //       }

  //       currentPosition += textLength
  //     }

  //     for (const child of node.childNodes) {
  //       if (walk(child)) {
  //         return true
  //       }
  //     }

  //     return false
  //   }

  //   const found = walk(el)

  //   // если курсор в конце
  //   if (!found) {
  //     range.selectNodeContents(el)
  //     range.collapse(false)
  //   }

  //   selection.removeAllRanges()
  //   selection.addRange(range)
  // }, [value])

  const handleInput = () => {
    let content = ''
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
      {!value && <span className="chat-kinda-placeholder">{placeholder}</span>}
    </div>
  )
}
export default ChatInput

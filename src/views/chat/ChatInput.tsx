import {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from 'react'
import { usePopupStore } from '@/controllers/popupController'

interface ChatInputProps {
  value: string
  setValue: Dispatch<SetStateAction<string>>
  placeholder?: string
}

export interface ChatInputHandle {
  insertEmojiAtCaret: (emoji: string) => void
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  ({ setValue: _setValue, placeholder }, ref) => {
    const [isEmpty, setIsEmpty] = useState(true)
    function emojiToUnified(emoji: string): string {
      return [...emoji]
        .map((char) => char.codePointAt(0)?.toString(16))
        .filter(Boolean)
        .join('-')
    }

    const inputRef = useRef<HTMLDivElement>(null)
    const popupOpen = usePopupStore((s) => Boolean(s.children))
    const lastCaretOffset = useRef<number | null>(null)

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

    const getNodeLength = (node: Node): number => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent ?? ''
        return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].length
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        if (element.tagName === 'IMG') return 1
        return Array.from(node.childNodes).reduce((sum, child) => sum + getNodeLength(child), 0)
      }
      return 0
    }

    const getTextNodeGraphemeOffset = (node: Text, utf16Offset: number): number => {
      const text = node.textContent ?? ''
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      let offset = 0
      let consumed = 0

      for (const segment of segmenter.segment(text)) {
        const segmentText = segment.segment
        const segmentLength = segmentText.length
        if (utf16Offset < consumed + segmentLength) {
          return offset
        }
        consumed += segmentLength
        offset += 1
      }

      return offset
    }

    const getCaretOffset = (root: Node): number | null => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return null

      const focusNode = selection.focusNode
      const focusOffset = selection.focusOffset
      if (!focusNode || !root.contains(focusNode)) return null

      let offset = 0
      const traverse = (node: Node): boolean => {
        if (node === focusNode) {
          if (node.nodeType === Node.TEXT_NODE) {
            offset += getTextNodeGraphemeOffset(node as Text, focusOffset)
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            if (element.tagName === 'IMG') {
              if (focusOffset > 0) offset += 1
            } else {
              for (let i = 0; i < focusOffset; i += 1) {
                offset += getNodeLength(node.childNodes[i])
              }
            }
          }
          return true
        }

        if (node.nodeType === Node.TEXT_NODE) {
          offset += getNodeLength(node)
          return false
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement
          if (element.tagName === 'IMG') {
            offset += 1
            return false
          }
          for (const child of Array.from(node.childNodes)) {
            if (traverse(child)) return true
          }
        }
        return false
      }

      traverse(root)
      return offset
    }

    const getTextNodeUtf16Offset = (node: Text, graphemeOffset: number): number => {
      const text = node.textContent ?? ''
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      let consumed = 0
      let count = 0

      for (const segment of segmenter.segment(text)) {
        if (count === graphemeOffset) break
        consumed += segment.segment.length
        count += 1
      }

      return consumed
    }

    const setCaretOffset = (root: Node, targetOffset: number) => {
      const selection = window.getSelection()
      if (!selection) return

      const range = document.createRange()
      let remaining = targetOffset

      const traverse = (node: Node): boolean => {
        if (node.nodeType === Node.TEXT_NODE) {
          const nodeLength = getNodeLength(node)
          if (remaining <= nodeLength) {
            const utf16Offset = getTextNodeUtf16Offset(node as Text, remaining)
            range.setStart(node, utf16Offset)
            range.collapse(true)
            return true
          }
          remaining -= nodeLength
          return false
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement
          if (element.tagName === 'IMG') {
            if (remaining === 0) {
              range.setStartBefore(node)
              range.collapse(true)
              return true
            }
            if (remaining === 1) {
              range.setStartAfter(node)
              range.collapse(true)
              return true
            }
            remaining -= 1
            return false
          }

          for (const child of Array.from(node.childNodes)) {
            if (traverse(child)) return true
          }
        }
        return false
      }

      if (!traverse(root)) {
        range.setStart(root, root.childNodes.length)
        range.collapse(true)
      }

      selection.removeAllRanges()
      selection.addRange(range)
    }

    const restoreFocus = () => {
      const el = inputRef.current
      if (!el) return

      const caretOffset = getCaretOffset(el)
      lastCaretOffset.current = caretOffset

      setTimeout(() => {
        if (!inputRef.current) return
        inputRef.current.focus()
        if (lastCaretOffset.current !== null) {
          setCaretOffset(inputRef.current, lastCaretOffset.current)
        }
      }, 0)
    }

    const handleInput = () => {
      const el = inputRef.current
      if (!el) return

      const caretOffset = getCaretOffset(el)

      const existingSpans = Array.from(el.querySelectorAll('span'))
      existingSpans.forEach((span) => {
        const children = Array.from(span.childNodes)
        span.replaceWith(...children)
      })

      const textNodes: Text[] = []
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          return node.nodeValue != null ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        },
      })

      while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text)
      }

      textNodes.forEach((node) => {
        const currentContent = node.textContent as string
        const segmenter = new Intl.Segmenter(undefined, {
          granularity: 'grapheme',
        })

        const parts = [...segmenter.segment(currentContent)].map((s) => s.segment)

        const fragment = document.createDocumentFragment()
        let textBuffer = ''
        const flushText = () => {
          if (textBuffer.length === 0) return
          const span = document.createElement('span')
          span.textContent = textBuffer
          fragment.appendChild(span)
          textBuffer = ''
        }

        parts.forEach((item) => {
          const isEmoji = /\p{Extended_Pictographic}/u.test(item) || /\p{Emoji}/u.test(item)
          if (isEmoji) {
            flushText()
            const img = document.createElement('img')
            img.src = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${emojiToUnified(
              item
            )}.png`
            img.alt = item
            img.className = 'emoji'
            fragment.appendChild(img)
          } else {
            textBuffer += item
          }
        })

        flushText()
        if (fragment.childNodes.length > 0) {
          node.replaceWith(fragment)
        }
      })

      if (caretOffset !== null) {
        setCaretOffset(el, caretOffset)
      }
    }

    const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement
      const el = inputRef.current
      if (!el || target.tagName !== 'IMG') return

      const img = target as HTMLImageElement
      const rect = img.getBoundingClientRect()
      const clickX = event.clientX
      const placeBefore = clickX - rect.left < rect.width / 2

      const selection = window.getSelection()
      if (!selection) return

      const range = document.createRange()
      if (placeBefore) {
        range.setStartBefore(img)
      } else {
        range.setStartAfter(img)
      }
      range.collapse(true)

      selection.removeAllRanges()
      selection.addRange(range)
      el.focus()
      event.preventDefault()
    }

    const insertEmojiAtCaret = (emoji: string) => {
      const el = inputRef.current
      if (!el) return

      let selection = window.getSelection()

      // Если выделение не внутри input, установим каретку внутрь input
      if (
        !selection ||
        selection.rangeCount === 0 ||
        !selection.focusNode ||
        !el.contains(selection.focusNode)
      ) {
        el.focus()
        if (lastCaretOffset.current !== null) {
          setCaretOffset(el, lastCaretOffset.current)
        } else {
          const r = document.createRange()
          r.selectNodeContents(el)
          r.collapse(false)
          selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            selection.addRange(r)
          }
        }

        selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return
      }

      // Insert emoji text node
      const textNode = document.createTextNode(emoji)
      selection.getRangeAt(0).insertNode(textNode)
      selection.collapseToEnd() // Move caret after emoji

      // Trigger handleInput to process emoji and restore caret position
      setTimeout(() => {
        handleInput()
      }, 0)
    }

    useImperativeHandle(ref, () => ({
      insertEmojiAtCaret,
    }))

    return (
      <div className="chat-kinda-input">
        <div
          className="chat-kinda-input__content"
          contentEditable
          tabIndex={0}
          ref={inputRef}
          onMouseDown={handleMouseDown}
          onBlur={() => {
            if (popupOpen) {
              restoreFocus()
            }
          }}
          onInput={handleInput}
        ></div>
        {isEmpty && <span className="chat-kinda-placeholder">{placeholder}</span>}
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'
export default ChatInput

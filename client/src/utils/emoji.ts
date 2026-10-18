export type EmojiTextSegment =
  | { type: 'text'; value: string }
  | { type: 'emoji'; value: string; unified: string }

export function emojiToUnified(emoji: string): string {
  return [...emoji]
    .map((character) => character.codePointAt(0)?.toString(16).padStart(4, '0'))
    .filter(Boolean)
    .join('-')
}

export function splitEmojiText(value: string): EmojiTextSegment[] {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  const result: EmojiTextSegment[] = []
  let text = ''

  const flushText = () => {
    if (!text) return
    result.push({ type: 'text', value: text })
    text = ''
  }

  for (const { segment } of segmenter.segment(value)) {
    const isEmoji =
      (/\p{Extended_Pictographic}/u.test(segment) ||
        /\p{Regional_Indicator}/u.test(segment)) &&
      !/^[0-9]$/.test(segment)

    if (!isEmoji) {
      text += segment
      continue
    }

    flushText()
    result.push({ type: 'emoji', value: segment, unified: emojiToUnified(segment) })
  }

  flushText()
  return result
}
import { cloneElement, Fragment, isValidElement, type ReactNode } from 'react'
import { splitEmojiText } from '@/utils/emoji'

function renderEmojiNodes(node: ReactNode, className: string): ReactNode {
  if (typeof node === 'string') {
    return splitEmojiText(node).map((segment, index) =>
      segment.type === 'emoji' ? (
        <img
          key={`${segment.unified}-${index}`}
          className={className}
          src={`/images/emoji/apple/64/${segment.unified}.png`}
          alt={segment.value}
          draggable={false}
        />
      ) : (
        <Fragment key={`text-${index}`}>{segment.value}</Fragment>
      )
    )
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <Fragment key={index}>{renderEmojiNodes(child, className)}</Fragment>
    ))
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    if (node.type === 'code' || node.type === 'pre' || node.props.children === undefined) {
      return node
    }

    return cloneElement(node, undefined, renderEmojiNodes(node.props.children, className))
  }

  return node
}

export function EmojiText({
  children,
  className = 'message-emoji',
}: {
  children: ReactNode
  className?: string
}) {
  return <>{renderEmojiNodes(children, className)}</>
}
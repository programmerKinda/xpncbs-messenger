import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const MessageText: React.FC<{
  content: string
  onMention?: (username: string) => void
}> = ({ content, onMention }) => {
  const contentWithMentions = content.replace(
    /(^|\s)@([a-zA-Z0-9_]{3,32})/g,
    '$1[@$2](#mention-$2)',
  )

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => <p className="message-text" {...props} />,
        a: (props) => (
          <a
            {...props}
            target={props.href?.startsWith('#mention-') ? undefined : '_blank'}
            rel={props.href?.startsWith('#mention-') ? undefined : 'noopener noreferrer'}
            className={props.href?.startsWith('#mention-') ? 'message-mention' : 'message-link'}
            onClick={(event) => {
              if (!props.href?.startsWith('#mention-')) return
              event.preventDefault()
              onMention?.(props.href.slice('#mention-'.length))
            }}
          />
        ),
      }}
    >
      {contentWithMentions}
    </ReactMarkdown>
  )
}

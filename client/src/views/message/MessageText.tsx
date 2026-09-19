import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const MessageText: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ node, ...props }) => <p className="message-text" {...props} />,
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer" className="message-link" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

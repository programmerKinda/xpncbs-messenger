import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const MessageText: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="message-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="message-link" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

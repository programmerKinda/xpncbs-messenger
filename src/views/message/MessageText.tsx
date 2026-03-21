import { Interweave } from 'interweave'
import { UrlMatcher } from 'interweave-autolink'
export const MessageText: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="message-text">
      <Interweave
        content={content}
        matchers={[new UrlMatcher('url')]}
        newWindow={true}
        attributes={{ rel: 'noopener noreferrer', className: 'message-link' }}
      />
    </div>
  )
}

import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { EmojiText } from '@/shared/components/EmojiText'
import { extractVideoLinks } from '@/utils/video'
import VideoPreview from './VideoPreview'

const withEmoji = (children: ReactNode) => <EmojiText>{children}</EmojiText>

function removeVideoLinks(content: string): string {
  const isVideoUrl = (url: string) => extractVideoLinks(url).length > 0

  return content
    .replace(/\[[^\]]*\]\((https?:\/\/[^)]+)\)/gi, (match, url: string) =>
      isVideoUrl(url) ? '' : match
    )
    .replace(/https?:\/\/[^\s<>"'`]+/gi, (url) => (isVideoUrl(url) ? '' : url))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export const MessageText: React.FC<{
  content: string
  onMention?: (username: string) => void
  embedYouTubeLinks?: boolean
}> = ({ content, onMention, embedYouTubeLinks = true }) => {
  const videoLinks = extractVideoLinks(content)
  const description = videoLinks.length > 0 ? removeVideoLinks(content) : ''
  const renderMarkdown = (markdown: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children, ...props }) => (
          <p className="message-text" {...props}>
            {withEmoji(children)}
          </p>
        ),
        li: ({ children, ...props }) => <li {...props}>{withEmoji(children)}</li>,
        h1: ({ children, ...props }) => <h1 {...props}>{withEmoji(children)}</h1>,
        h2: ({ children, ...props }) => <h2 {...props}>{withEmoji(children)}</h2>,
        h3: ({ children, ...props }) => <h3 {...props}>{withEmoji(children)}</h3>,
        h4: ({ children, ...props }) => <h4 {...props}>{withEmoji(children)}</h4>,
        h5: ({ children, ...props }) => <h5 {...props}>{withEmoji(children)}</h5>,
        h6: ({ children, ...props }) => <h6 {...props}>{withEmoji(children)}</h6>,
        th: ({ children, ...props }) => <th {...props}>{withEmoji(children)}</th>,
        td: ({ children, ...props }) => <td {...props}>{withEmoji(children)}</td>,
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
          >
            {withEmoji(props.children)}
          </a>
        ),
      }}
    >
      {markdown.replace(/(^|\s)@([a-zA-Z0-9_]{3,32})/g, '$1[@$2](#mention-$2)')}
    </ReactMarkdown>
  )

  return (
    <>
      {videoLinks.length === 0 || !embedYouTubeLinks ? (
        renderMarkdown(content)
      ) : (
        <>
          {description && renderMarkdown(description)}
          <div className="message-video-links">
            {videoLinks.map((video) => (
              <a
                className="message-link"
                href={video.url}
                key={`${video.provider}:${video.id}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {video.url}
              </a>
            ))}
          </div>
          {videoLinks.map((video) => (
            <VideoPreview key={`${video.provider}:${video.id}`} video={video} />
          ))}
        </>
      )}
    </>
  )
}

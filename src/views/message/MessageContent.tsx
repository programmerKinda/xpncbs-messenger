import { MessageText } from './MessageText'
import { getDataUrl } from '@/utils/getDataUrl'

const MessageContent = {
  text: ({ content }: { content: string }) => <MessageText content={content} />,
  voice: ({ content }: { content: string }) => (
    <audio src={getDataUrl(content, 'audio/webm')} controls />
  ),
}

export default MessageContent

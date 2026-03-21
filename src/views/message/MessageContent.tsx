import { getDataUrl } from '@/utils/getDataUrl'
const MessageContent = {
  text: ({ content }: { content: string }) => <p className="message-text">{content}</p>,
  voice: ({ content }: { content: string }) => (
    <audio src={getDataUrl(content, 'audio/webm')} controls />
  ),
}
export default MessageContent

export const getDataUrl = (content: string, mimeType: string): string => {
  if (content.startsWith('data:')) return content
  if (content.startsWith('http')) return content
  return `data:${mimeType};base64,${content}`
}

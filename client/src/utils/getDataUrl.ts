export const getDataUrl = (content: string): string => {
  if (content.startsWith('data:')) return content
  if (content.startsWith('http')) return content
  if (content.startsWith('/')) return `${window.location.origin}${content}`
  return content
}

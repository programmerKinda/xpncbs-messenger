export type VideoProvider = 'youtube' | 'vkvideo'

export interface VideoLink {
  id: string
  url: string
  provider: VideoProvider
}

export function extractVideoLinks(content: string): VideoLink[] {
  const urls = content.match(/https?:\/\/[^\s<>"'`]+/gi) ?? []
  const videos = new Map<string, VideoLink>()

  for (const candidate of urls) {
    const cleanedUrl = candidate.replace(/[.,!?;:)\]}]+$/, '')
    let parsedUrl: URL

    try {
      parsedUrl = new URL(cleanedUrl)
    } catch {
      continue
    }

    const hostname = parsedUrl.hostname.toLowerCase()
    let videoId: string | null = null
    let provider: VideoProvider | null = null

    if (hostname === 'youtu.be') {
      provider = 'youtube'
      videoId = parsedUrl.pathname.split('/').filter(Boolean)[0] ?? null
    } else if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com')) {
      provider = 'youtube'
      if (parsedUrl.pathname === '/watch') {
        videoId = parsedUrl.searchParams.get('v')
      } else {
        videoId = parsedUrl.pathname.match(/^\/(?:embed|live|shorts|v)\/([^/]+)/)?.[1] ?? null
      }
    } else if (hostname === 'vkvideo.ru' || hostname.endsWith('.vkvideo.ru')) {
      provider = 'vkvideo'
      videoId = parsedUrl.pathname.match(/^\/video(-?\d+_\d+)\/?$/)?.[1] ?? null
    }

    const validId =
      provider === 'youtube'
        ? Boolean(videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId))
        : Boolean(videoId && /^-?\d+_\d+$/.test(videoId))
    if (!provider || !videoId || !validId) continue
    videos.set(`${provider}:${videoId}`, { id: videoId, url: cleanedUrl, provider })
  }

  return [...videos.values()]
}
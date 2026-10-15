export function parseYouTubeId(raw: string): string | null {
  const text = raw.trim()
  if (!text) return null

  try {
    const url = new URL(text)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()

    if (host === 'youtu.be') {
      return validId(url.pathname.split('/').filter(Boolean)[0])
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const v = url.searchParams.get('v')
      if (v) return validId(v)
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live' || parts[0] === 'v') {
        return validId(parts[1])
      }
    }
  } catch {
    return validId(text)
  }

  return null
}

function validId(id?: string | null) {
  if (!id) return null
  const clean = id.replace(/[^A-Za-z0-9_-]/g, '')
  return /^[A-Za-z0-9_-]{11}$/.test(clean) ? clean : null
}

function looksLikeVideo(buf: ArrayBuffer) {
  const u8 = new Uint8Array(buf.slice(0, 16))
  if (u8.length < 12) return false
  const four = (i: number) => String.fromCharCode(u8[i], u8[i + 1], u8[i + 2], u8[i + 3])
  if (four(4) === 'ftyp') return true
  if (u8[0] === 0x1a && u8[1] === 0x45 && u8[2] === 0xdf && u8[3] === 0xa3) return true
  return false
}

/** Download a YouTube / Shorts URL as a File. Never send the URL to /predict. */
export async function fetchYoutubeAsFile(rawUrl: string, signal?: AbortSignal): Promise<File> {
  const id = parseYouTubeId(rawUrl)
  if (!id) throw new Error('Enter a valid YouTube or Shorts link')

  const res = await fetch(`/api/yt-file?url=${encodeURIComponent(rawUrl.trim())}`, { signal })
  const buf = await res.arrayBuffer()
  if (!res.ok) {
    const text = new TextDecoder().decode(buf.slice(0, 400))
    try {
      const data = JSON.parse(text) as { detail?: string }
      throw new Error(data.detail || 'YouTube download failed')
    } catch (e) {
      if (e instanceof Error && e.message !== 'YouTube download failed' && !e.message.startsWith('Unexpected')) throw e
      throw new Error(text.replace(/<[^>]+>/g, ' ').trim().slice(0, 180) || 'YouTube download failed')
    }
  }

  if (!looksLikeVideo(buf)) throw new Error('YouTube host did not return a video file')
  return new File([buf], `youtube-${id}.mp4`, { type: 'video/mp4' })
}

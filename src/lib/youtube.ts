import type { PredictResult } from './vision'

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

async function readError(buf: ArrayBuffer) {
  const text = new TextDecoder().decode(buf.slice(0, 400))
  try {
    const data = JSON.parse(text) as { detail?: string }
    return data.detail || 'YouTube download failed'
  } catch {
    return text.replace(/<[^>]+>/g, ' ').trim().slice(0, 180) || 'YouTube download failed'
  }
}

/** Download a YouTube / Shorts URL as a File (local / small clips). Never send the URL to /predict. */
export async function fetchYoutubeAsFile(rawUrl: string, signal?: AbortSignal): Promise<File> {
  const id = parseYouTubeId(rawUrl)
  if (!id) throw new Error('Enter a valid YouTube or Shorts link')

  const res = await fetch(`/api/yt-file?mode=file&url=${encodeURIComponent(rawUrl.trim())}`, { signal })
  const buf = await res.arrayBuffer()
  if (!res.ok) throw new Error(await readError(buf))
  if (!looksLikeVideo(buf)) throw new Error('YouTube host did not return a video file')
  return new File([buf], `youtube-${id}.mp4`, { type: 'video/mp4' })
}

/**
 * On Vercel: download YouTube server-side and POST multipart `file` to Cloud Run.
 * Returns the same shape as /predict — never sends youtube_url to Cloud Run.
 */
export async function predictYouTube(
  rawUrl: string,
  opts: { stride?: number; conf?: number; signal?: AbortSignal } = {},
): Promise<PredictResult & { _source?: { name: string; bytes: number } }> {
  const id = parseYouTubeId(rawUrl)
  if (!id) throw new Error('Enter a valid YouTube or Shorts link')

  const params = new URLSearchParams({
    mode: 'predict',
    url: rawUrl.trim(),
    stride: String(opts.stride ?? 5),
  })
  if (opts.conf != null) params.set('conf', String(opts.conf))

  const res = await fetch(`/api/yt-file?${params}`, { method: 'GET', signal: opts.signal })
  const text = await res.text()
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error(text.replace(/<[^>]+>/g, ' ').trim().slice(0, 180) || 'YouTube predict failed')
  }
  if (!res.ok) {
    throw new Error(typeof raw.detail === 'string' ? raw.detail : 'YouTube predict failed')
  }

  const media_url =
    (typeof raw.media_url === 'string' && raw.media_url) ||
    (typeof raw.mediaUrl === 'string' && raw.mediaUrl) ||
    (typeof raw.video_url === 'string' && raw.video_url) ||
    null
  if (!media_url) throw new Error('API response missing media_url')

  const poster_url =
    (typeof raw.poster_url === 'string' && raw.poster_url) ||
    (typeof raw.posterUrl === 'string' && raw.posterUrl) ||
    null
  const csv_url =
    (typeof raw.csv_url === 'string' && raw.csv_url) ||
    (typeof raw.csvUrl === 'string' && raw.csvUrl) ||
    null

  return {
    ok: raw.ok !== false,
    kind: typeof raw.kind === 'string' ? raw.kind : 'video',
    result_id: typeof raw.result_id === 'string' ? raw.result_id : undefined,
    media_url,
    poster_url,
    csv_url,
    width: typeof raw.width === 'number' ? raw.width : undefined,
    height: typeof raw.height === 'number' ? raw.height : undefined,
    elapsed_ms: typeof raw.elapsed_ms === 'number' ? raw.elapsed_ms : undefined,
    detections: Array.isArray(raw.detections) ? (raw.detections as PredictResult['detections']) : [],
    summary: raw.summary && typeof raw.summary === 'object' ? (raw.summary as PredictResult['summary']) : undefined,
    note: typeof raw.note === 'string' ? raw.note : undefined,
    raw,
    _source:
      raw._source && typeof raw._source === 'object'
        ? (raw._source as { name: string; bytes: number })
        : { name: `youtube-${id}.mp4`, bytes: 0 },
  }
}

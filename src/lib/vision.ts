/** Same-origin proxy path (Vite / Vercel) — avoids browser CORS. */
export const SHEEP_API = '/sheep-api'
export const SHEEP_API_ORIGIN = 'https://snn-sheep-api-2txzd5xoia-ew.a.run.app'

/** 1 = every frame. Higher stride skips frames and the result video stutters. */
export const FRAME_INTERVAL = 1 as const

export type SheepDetection = {
  class?: string
  confidence?: number
  conf?: number
  bbox?: number[]
  [key: string]: unknown
}

export type PredictResult = {
  ok: boolean
  kind: 'image' | 'video' | string
  result_id?: string
  media_url: string
  poster_url: string | null
  width?: number
  height?: number
  elapsed_ms?: number
  detections: SheepDetection[]
  summary?: {
    count?: number
    frames_read?: number
    frames_out?: number
    inferences?: number
    by_class?: Record<string, number>
    seconds?: number
  }
  note?: string
  raw: Record<string, unknown>
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (path == null || typeof path !== 'string' || path.length === 0) return null

  if (path.startsWith(SHEEP_API_ORIGIN)) {
    return `${SHEEP_API}${path.slice(SHEEP_API_ORIGIN.length)}`
  }
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (path.startsWith(SHEEP_API)) return path
  return `${SHEEP_API}${path.startsWith('/') ? path : `/${path}`}`
}

function pickString(data: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return null
}

function isImagePath(path: string) {
  return /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(path)
}

function predictError(status: number, text: string) {
  const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (status === 413 || /request entity too large/i.test(plain)) {
    return 'File is too large for the API (~32 MB). 4K videos are compressed automatically — try a shorter clip if this continues.'
  }
  return plain.slice(0, 280) || `Predict failed (${status})`
}

export async function predictSheep(
  file: File,
  opts: { stride?: number; conf?: number; signal?: AbortSignal } = {},
): Promise<PredictResult> {
  const stride = opts.stride ?? FRAME_INTERVAL
  const fd = new FormData()
  fd.append('file', file)
  fd.append('stride', String(stride))
  if (opts.conf != null) fd.append('conf', String(opts.conf))

  const res = await fetch(`${SHEEP_API}/predict`, {
    method: 'POST',
    body: fd,
    signal: opts.signal,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(predictError(res.status, text))
  }

  const raw = (await res.json()) as Record<string, unknown>
  const media_url = pickString(raw, ['media_url', 'mediaUrl', 'video_url', 'videoUrl', 'output_url', 'url'])
  const poster_url = pickString(raw, ['poster_url', 'posterUrl', 'thumbnail_url', 'thumbnailUrl', 'poster'])

  if (!media_url) {
    throw new Error('API response missing media_url')
  }

  const kindRaw = typeof raw.kind === 'string' ? raw.kind : isImagePath(media_url) ? 'image' : 'video'
  const detections = Array.isArray(raw.detections) ? (raw.detections as SheepDetection[]) : []
  const summary =
    raw.summary && typeof raw.summary === 'object' ? (raw.summary as PredictResult['summary']) : undefined

  return {
    ok: raw.ok !== false,
    kind: kindRaw,
    result_id: typeof raw.result_id === 'string' ? raw.result_id : undefined,
    media_url,
    poster_url,
    width: typeof raw.width === 'number' ? raw.width : undefined,
    height: typeof raw.height === 'number' ? raw.height : undefined,
    elapsed_ms: typeof raw.elapsed_ms === 'number' ? raw.elapsed_ms : undefined,
    detections,
    summary,
    note: typeof raw.note === 'string' ? raw.note : undefined,
    raw,
  }
}

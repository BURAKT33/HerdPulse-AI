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
  csv_url: string | null
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
    by_class_dominant?: Record<string, number>
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

function originUrl(path: string) {
  const proxied = mediaUrl(path)
  if (!proxied) return null
  if (proxied.startsWith(SHEEP_API_ORIGIN)) return proxied
  if (proxied.startsWith(SHEEP_API)) return `${SHEEP_API_ORIGIN}${proxied.slice(SHEEP_API.length)}`
  return `${SHEEP_API_ORIGIN}${proxied.startsWith('/') ? proxied : `/${proxied}`}`
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Cloud Run stores results on ephemeral disk — GET can 404 on another instance. Retry, then keep a blob. */
export async function fetchResultBlob(path: string, signal?: AbortSignal): Promise<Blob> {
  const urls = [mediaUrl(path), originUrl(path)].filter((u, i, arr): u is string => !!u && arr.indexOf(u) === i)
  let lastMsg = 'Result expired or missing'

  for (let attempt = 0; attempt < 8; attempt++) {
    for (const url of urls) {
      throwIfAborted(signal)
      try {
        const res = await fetch(url, { signal })
        const buf = await res.arrayBuffer()
        const head = new TextDecoder().decode(buf.slice(0, 120))
        if (!res.ok || /expired or missing/i.test(head)) {
          lastMsg = head.replace(/<[^>]+>/g, ' ').trim().slice(0, 160) || `HTTP ${res.status}`
          continue
        }
        if (buf.byteLength < 64) continue
        const type = res.headers.get('content-type') || guessType(path)
        return new Blob([buf], { type })
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') throw e
        lastMsg = e instanceof Error ? e.message : 'Fetch failed'
      }
    }
    await sleep(400 + attempt * 350)
  }
  throw new Error(`${lastMsg}. Run detection again.`)
}

export async function fetchResultObjectUrl(path: string, signal?: AbortSignal): Promise<string> {
  const blob = await fetchResultBlob(path, signal)
  return URL.createObjectURL(blob)
}

function guessType(path: string) {
  if (/\.mp4(\?|$)/i.test(path)) return 'video/mp4'
  if (/\.webm(\?|$)/i.test(path)) return 'video/webm'
  if (/\.jpe?g(\?|$)/i.test(path)) return 'image/jpeg'
  if (/\.png(\?|$)/i.test(path)) return 'image/png'
  if (/\.csv(\?|$)/i.test(path)) return 'text/csv'
  return 'application/octet-stream'
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
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
  const csv_url = pickString(raw, ['csv_url', 'csvUrl', 'timeline_url', 'timelineUrl'])

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
    csv_url,
    width: typeof raw.width === 'number' ? raw.width : undefined,
    height: typeof raw.height === 'number' ? raw.height : undefined,
    elapsed_ms: typeof raw.elapsed_ms === 'number' ? raw.elapsed_ms : undefined,
    detections,
    summary,
    note: typeof raw.note === 'string' ? raw.note : undefined,
    raw,
  }
}

export type TimelinePoint = {
  t: number
  label: string
  total: number
  sit: number
  stand: number
  eat: number
  [key: string]: number | string
}

export type Timeline = {
  points: TimelinePoint[]
  series: string[]
}

export type BehaviourShare = {
  key: 'sit' | 'stand' | 'eat'
  label: string
  color: string
  sum: number
  avg: number
  pct: number
}

const BEHAVIOUR_META: BehaviourShare[] = [
  { key: 'sit', label: 'Sitting', color: '#F59E0B', sum: 0, avg: 0, pct: 0 },
  { key: 'stand', label: 'Standing', color: '#10B981', sum: 0, avg: 0, pct: 0 },
  { key: 'eat', label: 'Eating', color: '#0EA5E9', sum: 0, avg: 0, pct: 0 },
]

export function behaviourShares(timeline: Timeline | null, fallback?: Record<string, number>): BehaviourShare[] {
  const points = timeline?.points ?? []
  const n = points.length
  const sums = { sit: 0, stand: 0, eat: 0 }

  for (const p of points) {
    sums.sit += Number(p.sit) || 0
    sums.stand += Number(p.stand) || 0
    sums.eat += Number(p.eat) || 0
  }

  if (sums.sit + sums.stand + sums.eat === 0 && n) {
    for (const p of points) {
      const sit = Number(p.sit) || 0
      const stand = Number(p.stand) || 0
      const eat = Number(p.eat) || 0
      const max = Math.max(sit, stand, eat)
      if (max <= 0) continue
      if (sit === max) sums.sit += 1
      else if (stand === max) sums.stand += 1
      else sums.eat += 1
    }
  }

  if (sums.sit + sums.stand + sums.eat === 0) {
    const fb = normalizeCountMap(fallback)
    sums.sit = fb.sit
    sums.stand = fb.stand
    sums.eat = fb.eat
  }

  const total = sums.sit + sums.stand + sums.eat
  const denom = n || 1
  return BEHAVIOUR_META.map((m) => ({
    ...m,
    sum: sums[m.key],
    avg: sums[m.key] / denom,
    pct: total > 0 ? (sums[m.key] / total) * 100 : 0,
  }))
}

function normalizeCountMap(obj?: Record<string, number>) {
  const out = { sit: 0, stand: 0, eat: 0 }
  if (!obj) return out
  for (const [key, value] of Object.entries(obj)) {
    const dest = normalizeBehaviour(key)
    const n = Number(value)
    if (dest && Number.isFinite(n)) out[dest] += n
  }
  return out
}

function normalizeBehaviour(raw: string): 'sit' | 'stand' | 'eat' | null {
  const s = raw.trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (s === 'sit' || s === 'sitting' || s === 'n_sit' || s.includes('otur')) return 'sit'
  if (s === 'stand' || s === 'standing' || s === 'n_stand' || s.includes('ayak')) return 'stand'
  if (s === 'eat' || s === 'eating' || s === 'n_eat' || s.includes('feed') || s.includes('yem')) return 'eat'
  if (s.includes('sit') && !s.includes('stand')) return 'sit'
  if (s.includes('stand')) return 'stand'
  if (s.includes('eat')) return 'eat'
  return null
}

const TIME_KEYS = ['time_s', 'time', 't', 'seconds', 'second', 'timestamp', 'ts']
const FRAME_KEYS = ['frame', 'frame_idx', 'frame_index', 'i']
const CLASS_KEYS = ['class', 'behaviour', 'behavior', 'pose', 'dominant', 'pred', 'prediction', 'action']
const COUNT_KEYS = ['count', 'n', 'value', 'total']

export async function fetchTimeline(csvPath: string, signal?: AbortSignal): Promise<Timeline> {
  const blob = await fetchResultBlob(csvPath, signal)
  return parseTimelineCsv(await blob.text())
}

export function parseTimelineCsv(text: string): Timeline {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) return { points: [], series: [] }

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    const rec: Record<string, string> = {}
    headers.forEach((h, i) => {
      rec[h] = cells[i] ?? ''
    })
    return rec
  })

  const timeKey = headers.find((h) => TIME_KEYS.includes(h)) ?? headers.find((h) => FRAME_KEYS.includes(h))
  const classKey = headers.find((h) => CLASS_KEYS.includes(h))
  const countKey = headers.find((h) => COUNT_KEYS.includes(h))
  const wideCols = headers.filter((h) => normalizeBehaviour(h))

  const byTime = new Map<number, TimelinePoint>()

  const ensure = (t: number): TimelinePoint => {
    let p = byTime.get(t)
    if (!p) {
      p = { t, label: formatTimeLabel(t, timeKey), total: 0, sit: 0, stand: 0, eat: 0 }
      byTime.set(t, p)
    }
    return p
  }

  rows.forEach((rec, i) => {
    const t = timeKey ? Number(rec[timeKey]) : i
    if (!Number.isFinite(t)) return
    const p = ensure(t)

    if (wideCols.length) {
      for (const k of wideCols) {
        const n = Number(rec[k])
        const dest = normalizeBehaviour(k)
        if (dest && Number.isFinite(n)) p[dest] = n
      }
    } else if (classKey) {
      const dest = normalizeBehaviour(rec[classKey] ?? '')
      const n = countKey ? Number(rec[countKey]) : 1
      const val = Number.isFinite(n) ? n : 1
      if (dest) p[dest] = (Number(p[dest]) || 0) + val
    } else if (countKey) {
      const n = Number(rec[countKey])
      if (Number.isFinite(n)) p.total = n
    }

    const sit = num(p.sit)
    const stand = num(p.stand)
    const eat = num(p.eat)
    p.sit = sit
    p.stand = stand
    p.eat = eat
    p.total = sit + stand + eat || num(p.total)
  })

  const points = [...byTime.values()].sort((a, b) => a.t - b.t)
  const sampled = downsample(points, 360)
  const series = ['sit', 'stand', 'eat'].filter((k) => sampled.some((p) => num(p[k]) > 0))
  return { points: sampled, series: series.length ? series : ['total'] }
}

function num(v: number | string | undefined) {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function formatTimeLabel(t: number, timeKey: string | undefined) {
  if (timeKey && FRAME_KEYS.includes(timeKey)) return `f${t}`
  if (Number.isInteger(t)) return `${t}s`
  return `${t.toFixed(1)}s`
}

function downsample(points: TimelinePoint[], max: number) {
  if (points.length <= max) return points
  const step = Math.ceil(points.length / max)
  return points.filter((_, i) => i % step === 0 || i === points.length - 1)
}

function splitCsvLine(line: string) {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        quoted = !quoted
      }
    } else if ((c === ',' || c === ';' || c === '\t') && !quoted) {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out
}

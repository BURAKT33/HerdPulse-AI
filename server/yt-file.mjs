import { ClientType, Innertube } from 'youtubei.js'

const ID_RE = /^[A-Za-z0-9_-]{11}$/
const CLIENTS = [ClientType.ANDROID, ClientType.ANDROID_VR, ClientType.IOS, ClientType.TV]

export function parseYouTubeId(raw) {
  const text = String(raw || '').trim()
  if (!text) return null
  try {
    const url = new URL(text)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    if (host === 'youtu.be') return validId(url.pathname.split('/').filter(Boolean)[0])
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

function validId(id) {
  if (!id) return null
  const clean = String(id).replace(/[^A-Za-z0-9_-]/g, '')
  return ID_RE.test(clean) ? clean : null
}

function fail(message, status = 400) {
  const err = new Error(message)
  err.status = status
  throw err
}

const tubeCache = new Map()

function getTube(clientType) {
  let p = tubeCache.get(clientType)
  if (!p) {
    p = Innertube.create({ client_type: clientType, retrieve_player: false })
    tubeCache.set(clientType, p)
  }
  return p
}

function pickFormat(info) {
  const formats = [...(info.streaming_data?.formats || []), ...(info.streaming_data?.adaptive_formats || [])]
  return (
    formats.find((f) => f.itag === 18 && f.url) ||
    formats.find((f) => f.url && String(f.mime_type || '').startsWith('video/mp4') && !String(f.mime_type || '').includes('mp4a')) ||
    formats.find((f) => f.url && String(f.mime_type || '').startsWith('video/mp4')) ||
    formats.find((f) => f.url && String(f.mime_type || '').startsWith('video/'))
  )
}

async function tryClient(id, clientType) {
  const yt = await getTube(clientType)
  const info = await yt.getBasicInfo(id)
  const fmt = pickFormat(info)
  if (!fmt?.url) return null

  const res = await fetch(fmt.url)
  if (!res.ok) return null

  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 32_000 || buf.subarray(4, 8).toString() !== 'ftyp') return null

  return {
    buf,
    name: `youtube-${id}.mp4`,
    type: String(fmt.mime_type || 'video/mp4').split(';')[0] || 'video/mp4',
  }
}

/** Download a YouTube / Shorts URL as an MP4 buffer. Used only to build a File for /predict. */
export async function downloadYouTube(rawUrl) {
  const id = parseYouTubeId(rawUrl)
  if (!id) fail('Enter a valid YouTube or Shorts link', 400)

  let last = 'No downloadable video stream for that link'
  for (const client of CLIENTS) {
    try {
      const file = await tryClient(id, client)
      if (file) return file
    } catch (e) {
      last = e instanceof Error ? e.message : last
    }
  }

  fail(
    `${last}. YouTube often blocks cloud servers — try Upload with the downloaded clip, or another link.`,
    422,
  )
}

export const SHEEP_API_ORIGIN = 'https://snn-sheep-api-2txzd5xoia-ew.a.run.app'

/** Download YouTube as a file, then POST multipart `file` to Cloud Run /predict (never youtube_url). */
export async function predictFromYouTube(rawUrl, opts = {}) {
  const file = await downloadYouTube(rawUrl)
  const fd = new FormData()
  fd.append('file', new Blob([file.buf], { type: file.type }), file.name)
  fd.append('stride', String(opts.stride ?? 5))
  if (opts.conf != null) fd.append('conf', String(opts.conf))

  const res = await fetch(`${SHEEP_API_ORIGIN}/predict`, {
    method: 'POST',
    body: fd,
  })
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = { detail: text.slice(0, 280) }
  }
  if (!res.ok) {
    const detail = data?.detail || data?.message || text.replace(/<[^>]+>/g, ' ').trim().slice(0, 280)
    fail(typeof detail === 'string' ? detail : 'Predict failed', res.status === 413 ? 413 : 502)
  }
  return { ...data, _source: { name: file.name, bytes: file.buf.length } }
}

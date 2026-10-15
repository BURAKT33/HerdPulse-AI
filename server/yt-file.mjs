import { ClientType, Innertube } from 'youtubei.js'

const ID_RE = /^[A-Za-z0-9_-]{11}$/

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

let tubePromise

function getTube() {
  tubePromise ??= Innertube.create({ client_type: ClientType.ANDROID, retrieve_player: false })
  return tubePromise
}

function pickFormat(info) {
  const formats = [...(info.streaming_data?.formats || []), ...(info.streaming_data?.adaptive_formats || [])]
  return (
    formats.find((f) => f.itag === 18 && f.url) ||
    formats.find((f) => f.url && String(f.mime_type || '').startsWith('video/mp4')) ||
    formats.find((f) => f.url && String(f.mime_type || '').startsWith('video/'))
  )
}

/** Download a YouTube / Shorts URL as an MP4 buffer. Used only to build a File for /predict. */
export async function downloadYouTube(rawUrl) {
  const id = parseYouTubeId(rawUrl)
  if (!id) fail('Enter a valid YouTube or Shorts link', 400)

  const yt = await getTube()
  const info = await yt.getBasicInfo(id)
  const fmt = pickFormat(info)
  if (!fmt?.url) fail('No downloadable video stream for that link', 422)

  const res = await fetch(fmt.url)
  if (!res.ok) fail(`YouTube stream fetch failed (${res.status})`, 502)

  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 32_000 || buf.subarray(4, 8).toString() !== 'ftyp') {
    fail('YouTube host did not return a video file', 502)
  }

  return {
    buf,
    name: `youtube-${id}.mp4`,
    type: String(fmt.mime_type || 'video/mp4').split(';')[0] || 'video/mp4',
  }
}

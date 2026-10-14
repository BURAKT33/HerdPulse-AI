/** Cloud Run / Google Frontend rejects bodies above ~32 MB. */
export const MAX_UPLOAD_BYTES = 28 * 1024 * 1024
const VIDEO_MAX_SIDE = 720
const VIDEO_FPS = 25
const VIDEO_BITRATE = 1_800_000
const IMAGE_MAX_SIDE = 1280

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

const VIDEO_EXT = /\.(mp4|m4v|webm|mov|avi|mkv|mpeg|mpg|3gp)$/i
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|avif)$/i

function fileName(file: File) {
  return (file.name || '').trim()
}

function extKind(name: string): 'image' | 'video' | null {
  if (VIDEO_EXT.test(name)) return 'video'
  if (IMAGE_EXT.test(name)) return 'image'
  return null
}

function mimeKind(type: string | undefined): 'image' | 'video' | null {
  const t = (type || '').toLowerCase()
  if (t.startsWith('video/') || t === 'application/mp4' || t === 'application/quicktime') return 'video'
  if (t.startsWith('image/')) return 'image'
  return null
}

export function isVideoFile(file: File) {
  return extKind(fileName(file)) === 'video' || mimeKind(file.type) === 'video'
}

export function isImageFile(file: File) {
  if (extKind(fileName(file)) === 'video') return false
  return extKind(fileName(file)) === 'image' || mimeKind(file.type) === 'image'
}

async function sniffKind(file: File): Promise<'image' | 'video' | null> {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image'
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image'
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image'
  const four = (i: number) => String.fromCharCode(buf[i], buf[i + 1], buf[i + 2], buf[i + 3])
  if (four(4) === 'ftyp') return 'video'
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'video'
  if (four(0) === 'RIFF') {
    const form = four(8)
    if (form === 'WEBP') return 'image'
    if (form === 'AVI ') return 'video'
  }
  return null
}

export async function detectKind(file: File): Promise<'image' | 'video' | null> {
  if (!(file instanceof Blob)) return null
  return extKind(fileName(file)) || mimeKind(file.type) || (await sniffKind(file))
}

export type CompressProgress = (msg: string) => void

export async function prepareForUpload(
  file: File,
  opts: { signal?: AbortSignal; onProgress?: CompressProgress } = {},
): Promise<{ file: File; note: string }> {
  const kind = await detectKind(file)
  if (kind === 'image') {
    const out = await compressImage(file, opts)
    return { file: out, note: noteFor(file, out) }
  }
  if (kind === 'video') {
    if (file.size <= 20 * 1024 * 1024) {
      return { file, note: `Original ${formatBytes(file.size)} · under API limit` }
    }
    opts.onProgress?.(`Compressing ${formatBytes(file.size)} video to 720p…`)
    const out = await compressVideo(file, opts)
    if (out.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `Still ${formatBytes(out.size)} after compress (limit ${formatBytes(MAX_UPLOAD_BYTES)}). Use a shorter clip.`,
      )
    }
    return { file: out, note: noteFor(file, out) }
  }
  throw new Error('Please upload a photo or video file')
}

function noteFor(original: File, out: File) {
  if (out === original) return `Original ${formatBytes(original.size)}`
  return `${formatBytes(original.size)} → ${formatBytes(out.size)}`
}

async function compressImage(file: File, opts: { signal?: AbortSignal } = {}): Promise<File> {
  throwIfAborted(opts.signal)
  if (file.size <= 4 * 1024 * 1024) return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.82)
  throwIfAborted(opts.signal)
  if (blob.size >= file.size) return file
  return new File([blob], rename(file.name, '.jpg'), { type: 'image/jpeg' })
}

function recorderMimes(): Array<string | undefined> {
  const candidates: Array<string | undefined> = [
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
    undefined,
  ]
  if (typeof MediaRecorder === 'undefined') return []
  return candidates.filter((t) => t === undefined || MediaRecorder.isTypeSupported(t))
}

function captureCanvas(canvas: HTMLCanvasElement, fps: number) {
  const node = canvas as HTMLCanvasElement & {
    captureStream?: (n?: number) => MediaStream
    webkitCaptureStream?: (n?: number) => MediaStream
  }
  const fn = node.captureStream ?? node.webkitCaptureStream
  if (!fn) throw new Error('This browser cannot capture canvas video')
  return fn.call(node, fps)
}

async function compressVideo(file: File, opts: { signal?: AbortSignal; onProgress?: CompressProgress } = {}): Promise<File> {
  throwIfAborted(opts.signal)
  const mimes = recorderMimes()
  if (!mimes.length) {
    throw new Error('This browser cannot compress video. Use a smaller MP4 (under 20 MB).')
  }

  const src = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.setAttribute('playsinline', 'true')
  video.setAttribute('webkit-playsinline', 'true')
  video.preload = 'auto'
  video.crossOrigin = 'anonymous'
  video.src = src
  video.style.cssText = 'position:fixed;left:-9999px;width:2px;height:2px;opacity:0'
  document.body.appendChild(video)

  try {
    await waitEvent(video, 'loadeddata', opts.signal)
    const vw = video.videoWidth || VIDEO_MAX_SIDE
    const vh = video.videoHeight || VIDEO_MAX_SIDE
    const scale = Math.min(1, VIDEO_MAX_SIDE / Math.max(vw, vh))
    const w = Math.max(2, Math.round((vw * scale) / 2) * 2)
    const h = Math.max(2, Math.round((vh * scale) / 2) * 2)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('Canvas unavailable')

    video.currentTime = 0
    await waitEvent(video, 'seeked', opts.signal).catch(() => undefined)
    ctx.drawImage(video, 0, 0, w, h)

    let last: Error | null = null
    for (const mime of mimes) {
      throwIfAborted(opts.signal)
      opts.onProgress?.(`Compressing ${w}×${h} · ${mime ?? 'default encoder'}`)
      try {
        return await recordPass(video, canvas, ctx, w, h, mime, opts)
      } catch (e) {
        last = e instanceof Error ? e : new Error('Video compress failed')
      }
    }
    throw last ?? new Error('Video compress failed')
  } finally {
    URL.revokeObjectURL(src)
    video.pause()
    video.removeAttribute('src')
    video.load()
    video.remove()
  }
}

async function recordPass(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mime: string | undefined,
  opts: { signal?: AbortSignal; onProgress?: CompressProgress },
): Promise<File> {
  const stream = captureCanvas(canvas, VIDEO_FPS)
  const chunks: Blob[] = []
  const options: MediaRecorderOptions = { videoBitsPerSecond: VIDEO_BITRATE }
  if (mime) options.mimeType = mime

  let rec: MediaRecorder
  try {
    rec = new MediaRecorder(stream, options)
  } catch {
    rec = new MediaRecorder(stream)
  }

  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data)
  }

  const stopped = new Promise<void>((resolve, reject) => {
    rec.onstop = () => resolve()
    rec.onerror = (ev) => {
      const err = (ev as Event & { error?: { name?: string; message?: string } }).error
      reject(new Error(err?.message || err?.name || 'Video compress failed'))
    }
  })

  video.pause()
  video.currentTime = 0
  await waitEvent(video, 'seeked', opts.signal).catch(() => undefined)
  ctx.drawImage(video, 0, 0, w, h)

  rec.start(250)
  video.playbackRate = 1
  try {
    await video.play()
  } catch {
    stream.getTracks().forEach((t) => t.stop())
    if (rec.state === 'recording') rec.stop()
    throw new Error('Browser blocked video playback. Click Run detection again.')
  }

  let raf = 0
  const draw = () => {
    if (video.readyState >= 2) ctx.drawImage(video, 0, 0, w, h)
    if (!video.paused && !video.ended) raf = requestAnimationFrame(draw)
  }
  draw()

  const duration = Number.isFinite(video.duration) ? video.duration : 0
  const tick = window.setInterval(() => {
    const t = video.currentTime || 0
    opts.onProgress?.(
      duration ? `Compressing ${t.toFixed(1)}s / ${duration.toFixed(1)}s · ${w}×${h}` : `Compressing ${w}×${h}`,
    )
  }, 400)

  try {
    await waitEvent(video, 'ended', opts.signal)
  } finally {
    window.clearInterval(tick)
    cancelAnimationFrame(raf)
  }

  ctx.drawImage(video, 0, 0, w, h)
  if (rec.state === 'recording') rec.stop()
  await stopped
  stream.getTracks().forEach((t) => t.stop())

  const type = rec.mimeType || mime || chunks[0]?.type || 'video/webm'
  const blob = new Blob(chunks, { type: type.includes('mp4') ? 'video/mp4' : 'video/webm' })
  if (blob.size < 1024) throw new Error('Compressed video was empty')
  const ext = blob.type.includes('mp4') ? '.mp4' : '.webm'
  return new File([blob], rename('sheep-clip', ext), { type: blob.type })
}

function rename(name: string, ext: string) {
  const base = name.replace(/\.[^.]+$/, '') || 'upload'
  return `${base}${ext}`
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Image compress failed'))), type, quality)
  })
}

function waitEvent(el: HTMLMediaElement, event: string, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (event === 'loadeddata' && el.readyState >= 2) {
      resolve()
      return
    }
    const ok = () => {
      cleanup()
      resolve()
    }
    const bad = () => {
      cleanup()
      reject(new Error('Media error'))
    }
    const onAbort = () => {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const cleanup = () => {
      el.removeEventListener(event, ok)
      el.removeEventListener('error', bad)
      signal?.removeEventListener('abort', onAbort)
    }
    el.addEventListener(event, ok)
    el.addEventListener('error', bad)
    signal?.addEventListener('abort', onAbort)
  })
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
}

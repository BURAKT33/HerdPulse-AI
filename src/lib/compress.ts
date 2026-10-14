/** Cloud Run / Google Frontend rejects bodies above ~32 MB. */
export const MAX_UPLOAD_BYTES = 28 * 1024 * 1024
const VIDEO_MAX_SIDE = 720
const VIDEO_FPS = 30
const VIDEO_BITRATE = 2_800_000
const IMAGE_MAX_SIDE = 1280

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function isVideoFile(file: File) {
  return !!file.type?.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name)
}

export function isImageFile(file: File) {
  return !!file.type?.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp)$/i.test(file.name)
}

export type CompressProgress = (msg: string) => void

export async function prepareForUpload(
  file: File,
  opts: { signal?: AbortSignal; onProgress?: CompressProgress } = {},
): Promise<{ file: File; note: string }> {
  if (isImageFile(file)) {
    const out = await compressImage(file, opts)
    return { file: out, note: noteFor(file, out) }
  }
  if (isVideoFile(file)) {
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

function pickRecorderMime() {
  const candidates = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp8', 'video/webm']
  return candidates.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) ?? ''
}

async function compressVideo(file: File, opts: { signal?: AbortSignal; onProgress?: CompressProgress } = {}): Promise<File> {
  throwIfAborted(opts.signal)
  const mime = pickRecorderMime()
  if (!mime || typeof MediaRecorder === 'undefined') {
    throw new Error('This browser cannot compress video. Use a smaller MP4 (under 28 MB).')
  }

  const src = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.src = src

  try {
    await waitEvent(video, 'loadedmetadata', opts.signal)
    const vw = video.videoWidth || VIDEO_MAX_SIDE
    const vh = video.videoHeight || VIDEO_MAX_SIDE
    const scale = Math.min(1, VIDEO_MAX_SIDE / Math.max(vw, vh))
    const w = Math.max(2, Math.round((vw * scale) / 2) * 2)
    const h = Math.max(2, Math.round((vh * scale) / 2) * 2)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')

    const stream = canvas.captureStream(VIDEO_FPS)
    const chunks: BlobPart[] = []
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: VIDEO_BITRATE })
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data)
    }

    const stopped = new Promise<void>((resolve, reject) => {
      rec.onstop = () => resolve()
      rec.onerror = () => reject(new Error('Video compress failed'))
    })

    rec.start(200)

    let raf = 0
    const draw = () => {
      ctx.drawImage(video, 0, 0, w, h)
      if (!video.paused && !video.ended) raf = requestAnimationFrame(draw)
    }

    video.currentTime = 0
    video.playbackRate = 1
    await video.play()
    draw()

    const duration = Number.isFinite(video.duration) ? video.duration : 0
    const tick = window.setInterval(() => {
      const t = video.currentTime || 0
      opts.onProgress?.(
        duration ? `Compressing ${t.toFixed(1)}s / ${duration.toFixed(1)}s · ${w}×${h} @ ${VIDEO_FPS}fps` : `Compressing ${w}×${h}`,
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

    const ext = mime.includes('mp4') ? '.mp4' : '.webm'
    const blob = new Blob(chunks, { type: mime.includes('mp4') ? 'video/mp4' : 'video/webm' })
    if (blob.size < 1024) throw new Error('Compressed video was empty')
    return new File([blob], rename(file.name, ext), { type: blob.type })
  } finally {
    URL.revokeObjectURL(src)
    video.removeAttribute('src')
    video.load()
  }
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

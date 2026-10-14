import { useEffect, useRef, useState } from 'react'
import { Camera, Download, ImagePlus, Loader2, Play, Trash2, Upload, Video } from 'lucide-react'
import { Card, CardHead } from './DashShell'
import { FRAME_INTERVAL, fetchResultBlob, fetchResultObjectUrl, parseTimelineCsv, predictSheep, type PredictResult, type Timeline } from '../lib/vision'
import { formatBytes, isImageFile, isVideoFile, prepareForUpload } from '../lib/compress'
import SheepTimeline from './SheepTimeline'

type Props = {
  onToast?: (msg: string) => void
}

export default function CameraDetection({ onToast }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const resultBlobsRef = useRef<string[]>([])

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<PredictResult | null>(null)
  const [resultMedia, setResultMedia] = useState<string | null>(null)
  const [resultPoster, setResultPoster] = useState<string | null>(null)
  const [csvUrl, setCsvUrl] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [confidence, setConfidence] = useState(0.5)
  const [running, setRunning] = useState(false)
  const [waitSec, setWaitSec] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'compressing' | 'sending' | 'saving'>('idle')
  const [compressNote, setCompressNote] = useState<string | null>(null)

  const isVideo = file ? isVideoFile(file) : false
  const isImage = file ? isImageFile(file) : false
  const resultIsImage =
    result?.kind === 'image' || (!!resultMedia && /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(resultMedia))

  const revokeResultBlobs = () => {
    resultBlobsRef.current.forEach((u) => URL.revokeObjectURL(u))
    resultBlobsRef.current = []
  }

  const keepBlob = (url: string) => {
    resultBlobsRef.current.push(url)
    return url
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      revokeResultBlobs()
      abortRef.current?.abort()
    }
  }, [previewUrl])

  useEffect(() => {
    if (!running) {
      setWaitSec(0)
      return
    }
    const t0 = Date.now()
    const id = window.setInterval(() => setWaitSec(Math.floor((Date.now() - t0) / 1000)), 500)
    return () => window.clearInterval(id)
  }, [running])

  const clearMedia = () => {
    abortRef.current?.abort()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    revokeResultBlobs()
    setFile(null)
    setPreviewUrl(null)
    setResult(null)
    setResultMedia(null)
    setResultPoster(null)
    setCsvUrl(null)
    setTimeline(null)
    setError(null)
    setVideoFailed(false)
    setShowVideoPlayer(false)
    setPhase('idle')
    setCompressNote(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const onFile = (next: File | undefined) => {
    if (!next) return
    if (!isImageFile(next) && !isVideoFile(next)) {
      onToast?.('Please upload a photo or video file')
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    revokeResultBlobs()
    setFile(next)
    setPreviewUrl(URL.createObjectURL(next))
    setResult(null)
    setResultMedia(null)
    setResultPoster(null)
    setCsvUrl(null)
    setTimeline(null)
    setError(null)
    setVideoFailed(false)
    setShowVideoPlayer(false)
    setCompressNote(null)
    const sizeHint = formatBytes(next.size)
    const big = next.size > 28 * 1024 * 1024
    onToast?.(
      `${isImageFile(next) ? 'Photo' : 'Video'} ready · ${sizeHint}${big ? ' · will compress before send' : ''}`,
    )
  }

  const runDetection = async () => {
    if (!file) {
      onToast?.('Upload a photo or video first')
      return
    }
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setRunning(true)
    setError(null)
    setResult(null)
    setResultMedia(null)
    setResultPoster(null)
    setCsvUrl(null)
    setTimeline(null)
    setVideoFailed(false)
    setShowVideoPlayer(false)
    setPhase('compressing')
    setCompressNote(null)

    try {
      const prepared = await prepareForUpload(file, {
        signal: ac.signal,
        onProgress: (msg) => setCompressNote(msg),
      })
      setCompressNote(prepared.note)
      setPhase('sending')
      const data = await predictSheep(prepared.file, {
        stride: FRAME_INTERVAL,
        conf: confidence,
        signal: ac.signal,
      })

      setPhase('saving')
      revokeResultBlobs()
      setResult(data)

      let mediaSrc: string | null = null
      let posterSrc: string | null = null
      let csvSrc: string | null = null

      if (data.poster_url) {
        try {
          posterSrc = keepBlob(await fetchResultObjectUrl(data.poster_url, ac.signal))
          setResultPoster(posterSrc)
        } catch {
          posterSrc = null
        }
      }

      try {
        mediaSrc = keepBlob(await fetchResultObjectUrl(data.media_url, ac.signal))
        setResultMedia(mediaSrc)
      } catch {
        if (posterSrc) setResultMedia(posterSrc)
        else throw new Error('Annotated video expired on the API before it could be saved. Run detection again.')
      }

      if (data.csv_url) {
        try {
          const csvBlob = await fetchResultBlob(data.csv_url, ac.signal)
          setTimeline(parseTimelineCsv(await csvBlob.text()))
          csvSrc = keepBlob(URL.createObjectURL(csvBlob))
          setCsvUrl(csvSrc)
        } catch {
          setCsvUrl(null)
          setTimeline(null)
        }
      }

      // Videos: show annotated poster first (reliable). MP4 is optional player.
      if (data.kind === 'video') {
        setShowVideoPlayer(false)
      }

      const count = data.summary?.count ?? data.detections.length
      onToast?.(`Detection complete · ${count} sheep · ${data.elapsed_ms ?? '?'} ms`)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      const msg = e instanceof Error ? e.message : 'Detection failed'
      setError(msg)
      onToast?.(msg)
    } finally {
      setRunning(false)
      setPhase('idle')
    }
  }

  const count = result?.summary?.count ?? result?.detections.length ?? 0
  const mainVisual =
    resultIsImage
      ? resultMedia
      : resultPoster || (videoFailed || !showVideoPlayer ? resultPoster : null)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <Card className="overflow-hidden">
          <CardHead
            title="Detection result"
            sub={file ? file.name : 'Upload a barn photo or exit-race video'}
            right={
              file && (
                <span className="flex items-center gap-1.5 rounded-md bg-sky-ai/10 px-2 py-1 text-[11px] font-bold text-sky-ai">
                  {isImage ? <ImagePlus size={12} /> : <Video size={12} />}
                  {isImage ? 'Photo' : 'Video'}
                </span>
              )
            }
          />
          <div className="relative mx-5 mb-5 min-h-[320px] overflow-hidden rounded-xl bg-charcoal sm:aspect-[9/16] sm:max-h-[70vh] lg:aspect-video lg:max-h-none">
            {!file && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-green-brand">
                  <Upload size={26} />
                </span>
                <span className="text-sm font-bold text-white">Drop photo or video</span>
                <span className="text-xs text-slate-400">JPG, PNG, MP4, WebM → POST /predict</span>
              </button>
            )}

            {file && !resultMedia && previewUrl && (
              <div className="absolute inset-0">
                {isVideo ? (
                  <video src={previewUrl} className="h-full w-full object-contain" muted playsInline controls preload="metadata" />
                ) : (
                  <img src={previewUrl} alt="Upload preview" className="h-full w-full object-contain" />
                )}
              </div>
            )}

            {resultMedia && resultIsImage && (
              <div className="absolute inset-0">
                <img src={resultMedia} alt="Annotated detection result" className="h-full w-full object-contain" />
              </div>
            )}

            {resultMedia && !resultIsImage && (
              <div className="absolute inset-0">
                {/* Prefer poster — annotated frame always displays for vertical / heavy MP4s */}
                {!showVideoPlayer && resultPoster && (
                  <img src={resultPoster} alt="Annotated poster frame" className="h-full w-full object-contain" />
                )}
                {(showVideoPlayer || !resultPoster) && (
                  <video
                    key={resultMedia}
                    src={resultMedia}
                    poster={resultPoster ?? undefined}
                    className="h-full w-full object-contain"
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => {
                      setVideoFailed(true)
                      setShowVideoPlayer(false)
                      onToast?.('Video could not play in browser — showing poster frame')
                    }}
                  />
                )}
                {!resultPoster && videoFailed && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-300">
                    Annotated video is ready but this browser cannot play it. Use Download below.
                  </div>
                )}
              </div>
            )}

            {(running || resultMedia) && (
              <div className="glass-dark absolute left-3 top-3 rounded-lg px-3 py-2 font-mono text-[11px] text-green-brand">
                {running
                  ? `● ${phase === 'compressing' ? 'COMPRESSING' : phase === 'saving' ? 'SAVING RESULT' : 'SENDING'} · ${waitSec}s`
                  : `● DONE · ${count} detected · conf ${(confidence * 100).toFixed(0)}%`}
              </div>
            )}
          </div>

          {resultMedia && !resultIsImage && (
            <div className="mx-5 mb-5 flex flex-wrap gap-2">
              {resultPoster && (
                <button
                  type="button"
                  onClick={() => setShowVideoPlayer(false)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold ${!showVideoPlayer ? 'bg-green-brand text-white' : 'border border-slate-200 bg-white'}`}
                >
                  Poster frame
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowVideoPlayer(true)
                  setVideoFailed(false)
                }}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${showVideoPlayer ? 'bg-green-brand text-white' : 'border border-slate-200 bg-white'}`}
              >
                Play annotated video
              </button>
              <a
                href={resultMedia}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:border-green-brand"
              >
                <Download size={14} /> Download MP4
              </a>
              {resultPoster && (
                <a
                  href={resultPoster}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:border-green-brand"
                >
                  <Download size={14} /> Download poster
                </a>
              )}
              {csvUrl && (
                <a
                  href={csvUrl}
                  download="sheep_timeline.csv"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:border-green-brand"
                >
                  <Download size={14} /> Download CSV
                </a>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-brand/10 text-green-deep">
                <Camera size={18} />
              </span>
              <div>
                <p className="text-sm font-bold">Camera Detection</p>
                <p className="text-xs text-slate-500">snn-sheep-api · /predict</p>
              </div>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-bold transition hover:border-green-brand hover:text-green-deep"
              >
                <Upload size={15} /> Upload
              </button>
              <button
                type="button"
                onClick={clearMedia}
                disabled={!file && !running}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-bold transition hover:border-amber-400 hover:text-amber-700 disabled:opacity-40"
              >
                <Trash2 size={15} /> Clear
              </button>
            </div>

            <label className="mt-5 block">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Confidence (conf)</span>
                <span className="tabular-nums text-charcoal">{(confidence * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.3}
                max={0.95}
                step={0.01}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="mt-2 w-full accent-green-brand"
              />
            </label>

            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-soft px-3 py-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">stride</span>
                <span className="font-mono font-bold tabular-nums text-charcoal">{FRAME_INTERVAL}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Fixed at 1 for photo and video — every frame is analysed.</p>
            </div>

            <button
              type="button"
              onClick={runDetection}
              disabled={!file || running}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-brand px-4 py-3 text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(16,185,129,0.9)] transition hover:bg-green-deep disabled:opacity-50"
            >
              {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              {running
                ? phase === 'compressing'
                  ? `Compressing… ${waitSec}s`
                  : phase === 'saving'
                    ? `Saving result… ${waitSec}s`
                    : `Sending… ${waitSec}s`
                : 'Run detection'}
            </button>

            {file && (
              <p className="mt-3 text-[11px] text-slate-500">
                Source {formatBytes(file.size)}
                {file.size > 28 * 1024 * 1024 ? ' · over 32 MB API cap, will compress' : ''}
              </p>
            )}
            {compressNote && <p className="mt-1 text-[11px] text-slate-500">{compressNote}</p>}
            {error && <p className="mt-3 break-words text-xs font-semibold text-amber-700">{error}</p>}
          </Card>

          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">API response</p>
            <dl className="mt-3 space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-slate-500">kind</dt>
                <dd className="font-mono text-[11px] text-charcoal">{result?.kind ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-slate-500">count</dt>
                <dd className="font-bold tabular-nums">{result ? count : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-slate-500">frames_out</dt>
                <dd className="font-mono text-[11px] tabular-nums">{result?.summary?.frames_out ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-slate-500">media</dt>
                <dd className="truncate font-mono text-[11px] text-charcoal">{resultMedia ? 'mp4/img' : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-slate-500">poster</dt>
                <dd className="truncate font-mono text-[11px] text-charcoal">{resultPoster ? 'jpg' : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-slate-500">csv_url</dt>
                <dd className="truncate font-mono text-[11px] text-charcoal">{csvUrl ? 'set' : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">elapsed</dt>
                <dd className="font-mono text-[11px] tabular-nums">
                  {result?.elapsed_ms != null ? `${result.elapsed_ms} ms` : '—'}
                </dd>
              </div>
            </dl>
            {mainVisual && resultIsImage && (
              <a href={resultMedia!} target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs font-bold text-green-deep hover:underline">
                Open annotated file
              </a>
            )}
          </Card>
        </div>
      </div>

      {(timeline || csvUrl || result?.summary?.by_class_dominant) && (
        <SheepTimeline
          timeline={timeline}
          csvUrl={csvUrl}
          dominant={result?.summary?.by_class_dominant ?? result?.summary?.by_class}
        />
      )}
    </div>
  )
}

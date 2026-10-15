import { downloadYouTube, predictFromYouTube } from '../server/yt-file.mjs'

export const config = {
  maxDuration: 300,
  memory: 1024,
}

function readUrl(req) {
  if (typeof req.query?.url === 'string') return req.query.url
  if (typeof req.body?.url === 'string') return req.body.url
  return ''
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ detail: 'Method not allowed' })
    return
  }

  const mode = typeof req.query?.mode === 'string' ? req.query.mode : 'predict'
  const url = readUrl(req)

  try {
    // Default: download on the server and forward multipart file to Cloud Run.
    // Avoids Vercel’s ~4.5 MB response limit when returning the video to the browser.
    if (mode === 'predict' || req.method === 'POST') {
      const conf = req.query?.conf != null ? Number(req.query.conf) : req.body?.conf
      const stride = req.query?.stride != null ? Number(req.query.stride) : req.body?.stride
      const data = await predictFromYouTube(url, {
        conf: Number.isFinite(conf) ? conf : undefined,
        stride: Number.isFinite(stride) ? stride : 5,
      })
      res.status(200).json(data)
      return
    }

    const file = await downloadYouTube(url)
    res.setHeader('Content-Type', file.type)
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`)
    res.setHeader('Content-Length', String(file.buf.length))
    res.end(file.buf)
  } catch (e) {
    const status = e.status || 500
    res.status(status).json({ detail: e.message || 'YouTube download failed' })
  }
}

import { downloadYouTube } from '../server/yt-file.mjs'

export const config = {
  maxDuration: 60,
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ detail: 'Method not allowed' })
    return
  }

  try {
    const url = typeof req.query?.url === 'string' ? req.query.url : req.body?.url
    const file = await downloadYouTube(url)
    res.setHeader('Content-Type', file.type)
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`)
    res.end(file.buf)
  } catch (e) {
    const status = e.status || 500
    res.status(status).json({ detail: e.message || 'YouTube download failed' })
  }
}

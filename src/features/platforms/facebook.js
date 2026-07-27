import axios from 'axios'
import { logger } from '#helpers/logger.js'

const GENERIC_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const headers = { 'User-Agent': GENERIC_UA, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.5', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Site': 'none' }

class FacebookService {
  async resolve(rawUrl, opts = {}) {
    const { hd = true } = opts
    const url = rawUrl.trim()
    const { id, shareType, shortLink } = this._parseUrl(url)

    let finalUrl
    if (shortLink) { finalUrl = await this._resolveShortLink(shortLink); if (!finalUrl) throw new Error('Gagal resolve link fb.watch.') }
    else if (shareType) finalUrl = `https://www.facebook.com/share/${shareType}/${id}`
    else if (id) finalUrl = `https://www.facebook.com/reel/${id}`
    else finalUrl = url

    const html = await this._fetchPage(finalUrl)
    if (!html) throw new Error('Gagal mengambil halaman Facebook.')
    return this._extract(html, id || shortLink, hd)
  }

  _parseUrl(url) {
    const shortMatch = url.match(/fb\.watch\/([A-Za-z0-9_-]+)/)
    if (shortMatch) return { shortLink: shortMatch[1] }
    const reelMatch = url.match(/facebook\.com\/reel\/(\d+)/)
    if (reelMatch) return { id: reelMatch[1] }
    const videoMatch = url.match(/facebook\.com\/(?:[^/]+\/)?videos?\/(?:[^/?#]+\/)?(\d+)/)
    if (videoMatch) return { id: videoMatch[1] }
    const shareMatch = url.match(/facebook\.com\/share\/([a-z])\/([A-Za-z0-9_-]+)/)
    if (shareMatch) return { shareType: shareMatch[1] || 'v', id: shareMatch[2] }
    const watchMatch = url.match(/[?&]v=(\d+)/)
    if (watchMatch) return { id: watchMatch[1] }
    return {}
  }

  async _resolveShortLink(shortLink) {
    try {
      const res = await axios.get(`https://fb.watch/${shortLink}`, { headers, maxRedirects: 0, validateStatus: s => s >= 200 && s < 400, timeout: 10_000 })
      if (res.headers?.location) return decodeURIComponent(res.headers.location)
      if (res.headers?.link) { const m = res.headers.link.match(/<(.*?)\/?>/); if (m) return decodeURIComponent(m[1]) }
      return null
    } catch (err) {
      const location = err?.response?.headers?.location
      if (location) return decodeURIComponent(location)
      return null
    }
  }

  async _fetchPage(url) {
    try {
      const { data } = await axios.get(url, { headers, timeout: 15_000, maxRedirects: 5 })
      return typeof data === 'string' ? data : null
    } catch (err) { logger.error({ err: err.message, url }, '[FB] Fetch failed'); return null }
  }

  _extract(html, idOrShort, preferHd) {
    const hdMatch = html.match('"browser_native_hd_url":(".*?")')
    const sdMatch = html.match('"browser_native_sd_url":(".*?")')
    const urlHd = hdMatch?.[1] ? JSON.parse(hdMatch[1]) : null
    const urlSd = sdMatch?.[1] ? JSON.parse(sdMatch[1]) : null
    if (!urlHd && !urlSd) throw new Error('Tidak bisa extract URL video.')
    const chosen = preferHd ? (urlHd ?? urlSd) : (urlSd ?? urlHd)
    const baseFilename = `facebook_${idOrShort || Date.now()}`
    let title = ''
    try { title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(/ \| Facebook$/, '').replace(/ - Facebook$/, '').trim().replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'") ?? '' } catch {}
    return { type: 'video', url: chosen, urlHd, urlSd, hasHd: !!urlHd, filename: `${baseFilename}.mp4`, title: title.slice(0, 100) }
  }

  async toBuffer(url) {
    try {
      const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 90_000, headers: { 'User-Agent': GENERIC_UA, 'referer': 'https://www.facebook.com/' }, maxContentLength: 500 * 1024 * 1024 })
      return Buffer.from(data)
    } catch (err) { throw new Error(`Gagal download video Facebook (${err.response?.status ?? 'timeout'}).`) }
  }
}

export const facebookService = new FacebookService()

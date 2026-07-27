import axios from 'axios'
import { logger } from '#helpers/logger.js'

const SHORT_DOMAIN = 'https://vt.tiktok.com/'
const VM_DOMAIN = 'https://vm.tiktok.com/'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const POST_ID_RE = /video\/(\d+)/
const SHORT_LINK_RE = /(?:vt|vm)\.tiktok\.com\/([A-Za-z0-9]+)/

class TiktokService {
  async resolve(rawUrl, opts = {}) {
    const url = rawUrl.trim()
    const postId = await this._resolvePostId(url)
    if (!postId) throw new Error('Tidak bisa resolve postId dari URL tersebut.')
    const { detail, cookie } = await this._fetchDetail(postId)
    const result = this._extract(detail, postId, opts)
    result._cookie = cookie
    return result
  }

  async _resolvePostId(url) {
    const direct = url.match(POST_ID_RE)
    if (direct) return direct[1]
    const shortMatch = url.match(SHORT_LINK_RE)
    if (shortMatch) {
      const shortCode = shortMatch[1]
      const base = url.includes('vm.tiktok') ? VM_DOMAIN : SHORT_DOMAIN
      try {
        const res = await axios.get(`${base}${shortCode}`, { maxRedirects: 0, validateStatus: s => s >= 200 && s < 400, headers: { 'user-agent': UA.split(' Chrome/1')[0] }, timeout: 10_000 })
        const location = res.headers['location'] ?? ''
        const fromLoc = location.match(POST_ID_RE)
        if (fromLoc) return fromLoc[1]
        const html = typeof res.data === 'string' ? res.data : ''
        if (html.startsWith('<a href="https://')) {
          const extracted = html.split('<a href="')[1].split('?')[0]
          const fromHtml = extracted.match(POST_ID_RE)
          if (fromHtml) return fromHtml[1]
        }
      } catch (err) {
        const location = err?.response?.headers?.['location'] ?? ''
        const fromErr = location.match(POST_ID_RE)
        if (fromErr) return fromErr[1]
      }
    }
    return null
  }

  async _fetchDetail(postId) {
    const pageUrl = `https://www.tiktok.com/@i/video/${postId}`
    let res
    try {
      res = await axios.get(pageUrl, { headers: { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9', 'accept': 'text/html,application/xhtml+xml' }, timeout: 15_000 })
    } catch (err) {
      throw new Error('Gagal mengambil halaman TikTok.')
    }
    const rawCookies = res.headers['set-cookie']
    const cookie = Array.isArray(rawCookies) ? rawCookies.map(c => c.split(';')[0]).join('; ') : ''
    const html = res.data
    if (typeof html !== 'string') throw new Error('Response bukan HTML.')
    let detail
    try {
      const jsonStr = html.split('<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">')[1]?.split('</script>')[0]
      if (!jsonStr) throw new Error('Script tag tidak ditemukan')
      const data = JSON.parse(jsonStr)
      const videoDetail = data['__DEFAULT_SCOPE__']?.['webapp.video-detail']
      if (!videoDetail) throw new Error('video-detail scope tidak ada')
      if (videoDetail.statusMsg) throw new Error(`Post tidak tersedia: ${videoDetail.statusMsg}`)
      detail = videoDetail?.itemInfo?.itemStruct
      if (!detail) throw new Error('itemStruct kosong')
    } catch (err) {
      throw new Error('Gagal parse data video. Mungkin dihapus, private, atau restricted.')
    }
    if (detail.isContentClassified) throw new Error('Konten ini dibatasi umur (18+).')
    if (!detail.author) throw new Error('Data author tidak ditemukan.')
    return { detail, cookie }
  }

  _extract(detail, postId, opts = {}) {
    const { audioOnly = false, fullAudio = false } = opts
    const author = detail.author?.uniqueId ?? 'unknown'
    const filenameBase = `tiktok_${author}_${postId}`
    const images = detail.imagePost?.images

    if (images && !audioOnly) {
      const imageUrls = images.map(i => i.imageURL?.urlList?.find(p => p.includes('.jpeg')) ?? i.imageURL?.urlList?.[0]).filter(Boolean)
      const audioUrl = detail.video?.playAddr ?? detail.music?.playUrl
      return { type: 'slideshow', images: imageUrls, audio: audioUrl, audioFilename: `${filenameBase}_audio`, title: detail.desc ?? '', author, duration: detail.video?.duration ?? 0 }
    }

    if (audioOnly) {
      let audioUrl = detail.video?.playAddr
      let audioFilename = `${filenameBase}_audio`
      if (fullAudio || !audioUrl) { audioUrl = detail.music?.playUrl; audioFilename += '_original' }
      const isMp3 = audioUrl?.includes('mime_type=audio_mpeg')
      return { type: 'audio', url: audioUrl, filename: `${audioFilename}.${isMp3 ? 'mp3' : 'm4a'}`, title: detail.desc ?? '', author, musicTitle: detail.music?.title ?? '', duration: detail.video?.duration ?? 0 }
    }

    const videoUrl = detail.video?.playAddr
    if (!videoUrl) throw new Error('URL video tidak tersedia.')
    return { type: 'video', url: videoUrl, filename: `${filenameBase}.mp4`, title: detail.desc ?? '', author, duration: detail.video?.duration ?? 0, width: detail.video?.width ?? 0, height: detail.video?.height ?? 0 }
  }

  async toBuffer(url, cookie = '') {
    try {
      const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 90_000, headers: { 'user-agent': UA, 'referer': 'https://www.tiktok.com/', 'accept': '*/*', ...(cookie ? { 'cookie': cookie } : {}) }, maxContentLength: 150 * 1024 * 1024 })
      return Buffer.from(data)
    } catch (err) {
      throw new Error(`Gagal download video (${err.response?.status ?? 'timeout'}).`)
    }
  }
}

export const tiktokService = new TiktokService()

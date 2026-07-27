import axios from 'axios'
import { logger } from '#helpers/logger.js'

const YT_API_KEY = 'AIzaSyA8eiZmM1FaDVjRy-df2KTyQ-vrgitc'
const YT_PLAYER_URL = 'https://www.youtube.com/youtubei/v1/player'

const CLIENTS = {
  WEB: { clientName: 'WEB', clientVersion: '2.20250522.01.00' },
  MWEB: { clientName: 'MWEB', clientVersion: '2.20250522.01.00' },
  TVHTML5: { clientName: 'TVHTML5', clientVersion: '7.20250522.10.00' },
}

const VIDEO_ID_RE = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/

class YoutubeService {
  async resolve(rawUrl, opts = {}) {
    const url = rawUrl.trim()
    const videoId = url.match(VIDEO_ID_RE)?.[1]
    if (!videoId) throw new Error('URL YouTube tidak valid.')

    const { audioOnly = false, quality = 'best' } = opts

    let playerData = await this._fetchPlayer(videoId, 'WEB')
    if (!this._isPlayable(playerData)) { playerData = await this._fetchPlayer(videoId, 'MWEB') }
    if (!this._isPlayable(playerData)) { playerData = await this._fetchPlayer(videoId, 'TVHTML5') }
    if (!this._isPlayable(playerData)) {
      throw new Error(`Video tidak bisa diputar: ${playerData?.playabilityStatus?.reason ?? 'Unknown'}`)
    }

    return this._extract(playerData, videoId, { audioOnly, quality })
  }

  async _fetchPlayer(videoId, clientName) {
    const client = CLIENTS[clientName]
    try {
      const { data } = await axios.post(`${YT_PLAYER_URL}?key=${YT_API_KEY}&prettyPrint=false`, {
        videoId, contentCheckOk: true, racyCheckOk: true,
        context: { client: { ...client, hl: 'en', gl: 'US', utcOffsetMinutes: 0 } },
      }, {
        headers: {
          'content-type': 'application/json',
          'user-agent': clientName === 'TVHTML5' ? 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0)' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'x-youtube-client-name': clientName === 'WEB' ? '1' : clientName === 'MWEB' ? '2' : '7',
          'x-youtube-client-version': client.clientVersion,
          origin: 'https://www.youtube.com', referer: 'https://www.youtube.com/',
        }, timeout: 15000,
      })
      return data
    } catch (err) {
      logger.warn({ clientName, videoId, err: err?.response?.data || err.message }, '[YT] Fetch failed')
      return null
    }
  }

  _isPlayable(data) { return !!(data?.streamingData?.formats?.length || data?.streamingData?.adaptiveFormats?.length) }

  _extract(playerData, videoId, opts) {
    const { audioOnly, quality } = opts
    const details = playerData.videoDetails ?? {}
    const formats = playerData.streamingData?.formats ?? []
    const adaptive = playerData.streamingData?.adaptiveFormats ?? []
    const allFormats = [...formats, ...adaptive]
    if (!allFormats.length) throw new Error('Tidak ada format stream tersedia.')

    const title = details.title ?? 'YouTube Video'
    const author = details.author ?? 'YouTube'
    const duration = parseInt(details.lengthSeconds ?? 0)
    const isShort = duration > 0 && duration <= 60

    if (audioOnly) {
      const audioFormats = adaptive.filter(f => f.mimeType?.startsWith('audio/') && f.url).sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))
      const best = audioFormats[0]
      if (!best?.url) throw new Error('Format audio tidak tersedia.')
      const ext = best.mimeType?.includes('webm') ? 'webm' : 'm4a'
      return { type: 'audio', url: best.url, filename: `yt_${_slug(title)}_${videoId}.${ext}`, title, author, duration, bitrate: best.bitrate, mimeType: best.mimeType }
    }

    const HEIGHT_MAP = { best: 99999, '1080': 1080, '720': 720, '480': 480, '360': 360, '240': 240, '144': 144 }
    const maxHeight = HEIGHT_MAP[quality] ?? 99999

    const muxed = formats.filter(f => f.url && (f.height ?? 0) <= maxHeight).sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    const progressive = muxed[0]

    if (progressive?.url) {
      const ext = progressive.mimeType?.includes('webm') ? 'webm' : 'mp4'
      return { type: 'video', mode: 'progressive', url: progressive.url, filename: `yt_${_slug(title)}_${videoId}.${ext}`, title, author, duration, width: progressive.width, height: progressive.height, quality: `${progressive.height}p`, mimeType: progressive.mimeType, isShort }
    }

    const videoAdaptive = adaptive.filter(f => f.mimeType?.startsWith('video/') && f.url && (f.height ?? 0) <= maxHeight).sort((a, b) => (b.height ?? 0) - (a.height ?? 0))[0]
    const audioAdaptive = adaptive.filter(f => f.mimeType?.startsWith('audio/') && f.url).sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0]
    if (!videoAdaptive?.url || !audioAdaptive?.url) throw new Error('Format adaptive video/audio tidak tersedia.')

    return { type: 'video', mode: 'adaptive', videoUrl: videoAdaptive.url, audioUrl: audioAdaptive.url, filename: `yt_${_slug(title)}_${videoId}.mp4`, title, author, duration, width: videoAdaptive.width, height: videoAdaptive.height, quality: `${videoAdaptive.height}p`, videoMimeType: videoAdaptive.mimeType, audioMimeType: audioAdaptive.mimeType, isShort }
  }

  async toBuffer(url) {
    try {
      const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 120000, headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', referer: 'https://www.youtube.com/' }, maxContentLength: 500 * 1024 * 1024 })
      return Buffer.from(data)
    } catch (err) {
      logger.error({ err: err.message }, '[YT] toBuffer failed')
      throw new Error(`Gagal download dari YouTube (${err.response?.status ?? 'timeout'}).`)
    }
  }
}

function _slug(str) { return str.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40).toLowerCase() }

export const youtubeService = new YoutubeService()

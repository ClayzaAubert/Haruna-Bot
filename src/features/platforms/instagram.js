import axios from 'axios'
import { randomBytes } from 'crypto'
import { logger } from '#helpers/logger.js'

const GENERIC_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const commonHeaders = { 'user-agent': GENERIC_UA, 'sec-gpc': '1', 'sec-fetch-site': 'same-origin', 'x-ig-app-id': '936619743392459' }
const mobileHeaders = { 'x-ig-app-locale': 'en_US', 'x-ig-device-locale': 'en_US', 'x-ig-mapped-locale': 'en_US', 'user-agent': 'Instagram 275.0.0.27.98 Android (33/13; 280dpi; 720x1423; Xiaomi; Redmi 7; onclite; qcom; en_US; 458229237)', 'accept-language': 'en-US', 'x-fb-http-engine': 'Liger', 'x-fb-client-ip': 'True', 'x-fb-server-cluster': 'True', 'content-length': '0' }
const embedHeaders = { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 'Accept-Language': 'en-GB,en;q=0.9', 'Cache-Control': 'max-age=0', 'Dnt': '1', 'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"', 'Sec-Ch-Ua-Mobile': '?0', 'Sec-Ch-Ua-Platform': '"macOS"', 'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Site': 'none', 'Sec-Fetch-User': '?1', 'Upgrade-Insecure-Requests': '1', 'User-Agent': GENERIC_UA }

const getNumberFromQuery = (name, data) => { const s = data?.match(new RegExp(name + '=(\\d+)'))?.[1]; if (+s) return +s }
const getObjectFromEntries = (name, data) => { const obj = data?.match(new RegExp('\\["' + name + '",.*?,({.*?}),\\d+\\]'))?.[1]; return obj && JSON.parse(obj) }

class InstagramService {
  async resolve(rawUrl) {
    const url = rawUrl.trim()
    const postId = this._extractPostId(url)
    const shareId = this._extractShareId(url)
    const storyMatch = url.match(/\/stories\/([^/]+)\/(\d+)/)

    if (shareId) {
      const resolved = await this._resolveShareLink(shareId)
      if (!resolved) throw new Error('Gagal resolve share link Instagram.')
      return this.resolve(resolved)
    }
    if (!postId && !storyMatch) throw new Error('URL Instagram tidak valid.')
    if (postId) return this._getPost(postId)
    throw new Error('Story Instagram tidak didukung tanpa cookies.')
  }

  _extractPostId(url) { return url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/)?.[1] ?? null }
  _extractShareId(url) { return url.match(/instagram\.com\/share\/(?:p\/|reel\/)?([A-Za-z0-9_-]+)/)?.[1] ?? null }

  async _resolveShareLink(shareId) {
    try {
      const res = await axios.get(`https://www.instagram.com/share/${shareId}/`, { headers: { 'user-agent': 'curl/7.88.1' }, maxRedirects: 5, timeout: 10_000, validateStatus: () => true })
      return res.headers?.location ?? res.request?.res?.responseUrl ?? null
    } catch { return null }
  }

  async _getMediaId(id) {
    try {
      const url = new URL('https://i.instagram.com/api/v1/oembed/')
      url.searchParams.set('url', `https://www.instagram.com/p/${id}/`)
      const { data } = await axios.get(url.toString(), { headers: mobileHeaders, timeout: 10_000 })
      return data?.media_id ?? null
    } catch { return null }
  }

  async _requestMobileApi(mediaId) {
    try {
      const { data } = await axios.get(`https://i.instagram.com/api/v1/media/${mediaId}/info/`, { headers: mobileHeaders, timeout: 12_000 })
      return data?.items?.[0] ?? null
    } catch { return null }
  }

  async _requestHTML(id) {
    try {
      const { data: html } = await axios.get(`https://www.instagram.com/p/${id}/embed/captioned/`, { headers: embedHeaders, timeout: 12_000 })
      const rawMatch = html?.match?.(/"init",\[\],\[(.*?)\]\],/)
      if (!rawMatch) return null
      let embedData = JSON.parse(rawMatch[1])
      if (!embedData?.contextJSON) return null
      return JSON.parse(embedData.contextJSON)
    } catch { return null }
  }

  async _getGQLParams(id) {
    try {
      const { data: html } = await axios.get(`https://www.instagram.com/p/${id}/`, { headers: embedHeaders, timeout: 12_000 })
      const siteData = getObjectFromEntries('SiteData', html)
      const polarisSiteData = getObjectFromEntries('PolarisSiteData', html)
      const webConfig = getObjectFromEntries('DGWWebConfig', html)
      const pushInfo = getObjectFromEntries('InstagramWebPushInfo', html)
      const lsd = getObjectFromEntries('LSD', html)?.token || randomBytes(8).toString('base64url')
      const csrf = getObjectFromEntries('InstagramSecurityConfig', html)?.csrf_token
      const anon_cookie = [csrf && `csrftoken=${csrf}`, polarisSiteData?.device_id && `ig_did=${polarisSiteData.device_id}`, 'wd=1280x720', 'dpr=2', polarisSiteData?.machine_id && `mid=${polarisSiteData.machine_id}`, 'ig_nrcb=1'].filter(Boolean).join('; ')
      return {
        headers: { 'x-ig-app-id': webConfig?.appId || '936619743392459', 'X-FB-LSD': lsd, 'X-CSRFToken': csrf, 'X-Bloks-Version-Id': getObjectFromEntries('WebBloksVersioningID', html)?.versioningID, 'x-asbd-id': '129477', cookie: anon_cookie },
        body: { __d: 'www', __a: '1', __s: '::' + Math.random().toString(36).substring(2).replace(/\d/g, '').slice(0, 6), __hs: siteData?.haste_session || '20126.HYP:instagram_web_pkg.2.1...0', __req: 'b', __ccg: 'EXCELLENT', __rev: pushInfo?.rollout_hash || '1019933358', __hsi: siteData?.hsi || '7436540909012459023', __dyn: randomBytes(154).toString('base64url'), __csr: randomBytes(154).toString('base64url'), __user: '0', __comet_req: getNumberFromQuery('__comet_req', html) || '7', av: '0', dpr: '2', lsd, jazoest: getNumberFromQuery('jazoest', html) || Math.floor(Math.random() * 10000), __spin_r: siteData?.__spin_r || '1019933358', __spin_b: siteData?.__spin_b || 'trunk', __spin_t: siteData?.__spin_t || Math.floor(Date.now() / 1000) },
      }
    } catch { return null }
  }

  async _requestGQL(id) {
    try {
      const params = await this._getGQLParams(id)
      if (!params) return null
      const { data } = await axios.post('https://www.instagram.com/graphql/query',
        new URLSearchParams({ ...params.body, fb_api_caller_class: 'RelayModern', fb_api_req_friendly_name: 'PolarisPostActionLoadPostQueryQuery', variables: JSON.stringify({ shortcode: id, fetch_tagged_user_count: null, hoisted_comment_id: null, hoisted_reply_id: null }), server_timestamps: true, doc_id: '8845758582119845' }).toString(),
        { headers: { ...embedHeaders, ...params.headers, 'content-type': 'application/x-www-form-urlencoded', 'X-FB-Friendly-Name': 'PolarisPostActionLoadPostQueryQuery' }, timeout: 15_000 })
      return { gql_data: data?.data ?? null }
    } catch { return null }
  }

  _extractOldPost(data, id) {
    const shortcodeMedia = data?.gql_data?.shortcode_media || data?.gql_data?.xdt_shortcode_media
    const sidecar = shortcodeMedia?.edge_sidecar_to_children
    if (sidecar) {
      const items = sidecar.edges.filter(e => e.node?.display_url).map((e, i) => ({ type: e.node?.is_video && e.node?.video_url ? 'video' : 'image', url: e.node?.is_video && e.node?.video_url ? e.node.video_url : e.node.display_url, thumb: e.node.display_url }))
      if (items.length) return { type: 'carousel', items, id }
    }
    if (shortcodeMedia?.video_url) return { type: 'video', url: shortcodeMedia.video_url, filename: `instagram_${id}.mp4` }
    if (shortcodeMedia?.display_url) return { type: 'image', url: shortcodeMedia.display_url, filename: `instagram_${id}.jpg` }
  }

  _extractNewPost(data, id) {
    const carousel = data.carousel_media
    if (carousel) {
      const items = carousel.filter(e => e?.image_versions2).map((e, i) => {
        const isVideo = !!e.video_versions
        const imageUrl = e.image_versions2.candidates[0].url
        const url = isVideo ? e.video_versions.reduce((a, b) => a.width * a.height < b.width * b.height ? b : a).url : imageUrl
        return { type: isVideo ? 'video' : 'image', url, thumb: imageUrl }
      })
      if (items.length) return { type: 'carousel', items, id }
    }
    if (data.video_versions) {
      const best = data.video_versions.reduce((a, b) => a.width * a.height < b.width * b.height ? b : a)
      return { type: 'video', url: best.url, filename: `instagram_${id}.mp4` }
    }
    if (data.image_versions2?.candidates) return { type: 'image', url: data.image_versions2.candidates[0].url, filename: `instagram_${id}.jpg` }
  }

  async _getPost(id) {
    const hasData = (d) => d && d.gql_data !== null && d?.gql_data?.xdt_shortcode_media !== null
    let data = null, result = null
    try {
      const mediaId = await this._getMediaId(id)
      if (mediaId) data = await this._requestMobileApi(mediaId)
      if (!hasData(data)) data = await this._requestHTML(id)
      if (!hasData(data)) data = await this._requestGQL(id)
    } catch (err) { logger.warn({ err: err.message, id }, '[IG] getPost error') }
    if (!data) throw new Error('Gagal mengambil data. Post mungkin private atau dihapus.')
    result = data?.gql_data !== undefined ? this._extractOldPost(data, id) : this._extractNewPost(data, id)
    if (!result) throw new Error('Tidak bisa extract media dari post ini.')
    return result
  }

  async toBuffer(url) {
    try {
      const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 60_000, headers: { 'user-agent': GENERIC_UA, 'referer': 'https://www.instagram.com/' }, maxContentLength: 200 * 1024 * 1024 })
      return Buffer.from(data)
    } catch (err) { throw new Error(`Gagal download media Instagram (${err.response?.status ?? 'timeout'}).`) }
  }
}

export const instagramService = new InstagramService()

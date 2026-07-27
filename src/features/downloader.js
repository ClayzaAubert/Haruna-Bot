import axios from 'axios'
import { logger } from '#helpers/logger.js'

class DownloaderService {
  async toBuffer(url, { timeout = 30_000 } = {}) {
    try {
      const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout })
      return Buffer.from(data)
    } catch (err) {
      logger.error({ err, url }, 'Downloader failed')
      throw new Error(`Gagal download dari ${url}`)
    }
  }

  async fetchJson(url, params = {}) {
    try {
      const { data } = await axios.get(url, { params, timeout: 15_000 })
      return data
    } catch (err) {
      logger.error({ err, url }, 'Fetch JSON failed')
      throw new Error('Gagal fetch data')
    }
  }
}

export const downloaderService = new DownloaderService()

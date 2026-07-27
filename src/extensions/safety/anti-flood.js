import { groupModel } from '#storage/models/index.js'
import { logger } from '#helpers/logger.js'

const DEFAULT_LIMIT = 5
const WINDOW_MS = 10_000
const msgLog = new Map()

export default {
  name: 'anti-flood',

  init() {
    setInterval(() => {
      const now = Date.now()
      for (const [key, times] of msgLog) {
        const fresh = times.filter(t => now - t < WINDOW_MS)
        if (fresh.length === 0) msgLog.delete(key)
        else msgLog.set(key, fresh)
      }
    }, 30_000)
    logger.debug('[AntiFlood] Initialized')
  },

  async processMessage(s, sock) {
    if (!s.isGroup || s.fromMe) return true

    const group = groupModel.find(s.jid)
    if (!group?.antiflood) return true

    const key = `${s.jid}:${s.sender}`
    const now = Date.now()
    const times = (msgLog.get(key) ?? []).filter(t => now - t < WINDOW_MS)
    times.push(now)
    msgLog.set(key, times)

    if (times.length > DEFAULT_LIMIT) {
      try {
        await sock.sendMessage(s.jid, { delete: s.key })
        if (times.length === DEFAULT_LIMIT + 1) {
          await sock.sendMessage(s.jid, {
            text: `Jangan flood @${s.sender.split('@')[0]}!`,
            mentions: [s.sender],
          })
          try { await sock.groupParticipantsUpdate(s.jid, [s.sender], 'demote') } catch {}
        }
        logger.debug({ jid: s.jid, sender: s.sender }, '[AntiFlood] Flood detected')
      } catch (err) {
        logger.warn({ err: err.message }, '[AntiFlood] Handler error')
      }
      return false
    }

    return true
  },
}

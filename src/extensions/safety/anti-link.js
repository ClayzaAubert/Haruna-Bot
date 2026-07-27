import { groupModel } from '#storage/models/index.js'
import { logger } from '#helpers/logger.js'

const LINK_PATTERN = /https?:\/\//i
const WA_LINK = /chat\.whatsapp\.com/i

export default {
  name: 'anti-link',

  init() { logger.debug('[AntiLink] Initialized') },

  async processMessage(s, sock) {
    if (!s.isGroup || s.fromMe) return true

    const group = groupModel.find(s.jid)
    if (!group?.antilink) return true

    if (!LINK_PATTERN.test(s.text) && !WA_LINK.test(s.text)) return true

    try {
      await sock.sendMessage(s.jid, { delete: s.key })
      await sock.sendMessage(s.jid, {
        text: `@${s.sender.split('@')[0]} link tidak diizinkan di grup ini!`,
        mentions: [s.sender],
      })
      logger.info({ jid: s.jid, sender: s.sender }, '[AntiLink] Link removed')
    } catch (err) {
      logger.error({ err }, '[AntiLink] Delete failed')
    }

    return false
  },
}

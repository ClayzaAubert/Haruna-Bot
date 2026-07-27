import { sleep } from '#helpers/formatter.js'
import { logger } from '#helpers/logger.js'

class BroadcastService {
  async send(sock, targets, content, opts = {}) {
    const { delayMs = 2500, onProgress } = opts
    let sent = 0, failed = 0
    const errors = []

    for (const jid of targets) {
      try {
        await sock.sendMessage(jid, content); sent++
      } catch {
        await sleep(3000)
        try { await sock.sendMessage(jid, content); sent++ }
        catch (retryErr) { failed++; errors.push({ jid, err: retryErr.message }) }
      }
      if (onProgress) onProgress(sent, failed, targets.length)
      if (sent + failed < targets.length) await sleep(delayMs)
    }

    logger.info({ sent, failed, total: targets.length }, '[Broadcast] Complete')
    return { sent, failed, errors }
  }

  async toAllGroups(sock, content, opts = {}) {
    const { db } = await import('#storage/connection.js')
    const groups = db.prepare('SELECT jid FROM groups WHERE mute = 0').all()
    return this.send(sock, groups.map(g => g.jid), content, opts)
  }

  async toAllUsers(sock, content, opts = {}) {
    const { db } = await import('#storage/connection.js')
    const users = db.prepare('SELECT jid FROM users WHERE banned = 0').all()
    return this.send(sock, users.map(u => u.jid), content, { delayMs: 5000, ...opts })
  }
}

export const broadcastService = new BroadcastService()

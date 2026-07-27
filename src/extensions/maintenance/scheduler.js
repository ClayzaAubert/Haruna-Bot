import { db } from '#storage/connection.js'
import { cooldownModel } from '#storage/models/index.js'
import { logger } from '#helpers/logger.js'

export default {
  name: 'scheduler',
  _timers: [],

  init() {
    this._timers.push(setInterval(() => this._cleanupCooldowns(), 10 * 60 * 1000))
    this._timers.push(setInterval(() => this._cleanupPremium(), 60 * 60 * 1000))
    this._timers.push(setInterval(() => this._dailyStats(), 24 * 60 * 60 * 1000))
    this._cleanupCooldowns()
    this._cleanupPremium()
    logger.info('[Scheduler] Initialized — 3 jobs')
  },

  destroy() { this._timers.forEach(t => clearInterval(t)); this._timers = [] },

  _cleanupCooldowns() {
    try {
      const deleted = cooldownModel.cleanup()
      if (deleted > 0) logger.debug(`[Scheduler] Cleaned ${deleted} cooldowns`)
    } catch (err) { logger.warn({ err: err.message }, '[Scheduler] Cooldown cleanup failed') }
  },

  _cleanupPremium() {
    try {
      const { changes } = db.prepare(`
        UPDATE users SET premium = 0, premium_exp = 0, updated_at = unixepoch()
        WHERE premium = 1 AND premium_exp > 0 AND premium_exp < unixepoch()
      `).run()
      if (changes > 0) logger.info(`[Scheduler] ${changes} expired premium cleaned`)
    } catch (err) { logger.warn({ err: err.message }, '[Scheduler] Premium cleanup failed') }
  },

  _dailyStats() {
    try {
      const users = db.prepare('SELECT COUNT(*) as c FROM users').get()?.c ?? 0
      const groups = db.prepare('SELECT COUNT(*) as c FROM groups').get()?.c ?? 0
      const premium = db.prepare('SELECT COUNT(*) as c FROM users WHERE premium = 1').get()?.c ?? 0
      const todayTx = db.prepare(`
        SELECT COUNT(*) as c FROM transactions WHERE created_at > unixepoch() - 86400
      `).get()?.c ?? 0
      logger.info({ users, groups, premium, todayTransactions: todayTx }, '[Scheduler] Daily stats')
    } catch (err) { logger.warn({ err: err.message }, '[Scheduler] Daily stats failed') }
  },
}

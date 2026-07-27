import { cooldownModel } from '#storage/models/index.js'
import { logger } from '#helpers/logger.js'

export default {
  name: 'cooldown-cleaner',

  init() {
    this._run()
    this._interval = setInterval(() => this._run(), 10 * 60 * 1000)
    logger.debug('[CooldownCleaner] Initialized')
  },

  destroy() { clearInterval(this._interval) },

  _run() {
    const deleted = cooldownModel.cleanup()
    if (deleted > 0) logger.debug(`[CooldownCleaner] Removed ${deleted} expired rows`)
  },
}

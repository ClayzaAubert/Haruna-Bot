import { logger } from '#helpers/logger.js'

class Orchestrator {
  constructor() { this._extensions = [] }

  register(ext) { this._extensions.push(ext) }
  count() { return this._extensions.length }

  destroyAll() {
    for (const ext of this._extensions) {
      if (typeof ext.destroy === 'function') {
        try { ext.destroy() } catch {}
      }
    }
    this._extensions = []
  }

  async runProcessors(parsed, sock) {
    for (const ext of this._extensions) {
      if (typeof ext.processMessage !== 'function') continue
      try {
        const ok = await ext.processMessage(parsed, sock)
        if (ok === false) return false
      } catch (err) {
        logger.error({ err, name: ext.name }, 'Extension processor error')
      }
    }
    return true
  }
}

export const orchestrator = new Orchestrator()

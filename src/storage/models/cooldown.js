import { db } from '#storage/connection.js'
import { lazyPrepare } from '#storage/lazy.js'

class CooldownModel {
  _get = lazyPrepare('SELECT expires_at FROM cooldowns WHERE key = ?')
  _set = lazyPrepare('INSERT INTO cooldowns (key, expires_at) VALUES (@key, @expiresAt) ON CONFLICT(key) DO UPDATE SET expires_at = excluded.expires_at')
  _delete = lazyPrepare('DELETE FROM cooldowns WHERE key = ?')
  _cleanup = lazyPrepare('DELETE FROM cooldowns WHERE expires_at < unixepoch()')

  check(jid, command) {
    const key = `${jid}:${command}`
    const row = this._get().get(key)
    if (!row) return 0
    const remaining = row.expires_at * 1000 - Date.now()
    if (remaining <= 0) {
      this._delete().run(key)
      return 0
    }
    return remaining
  }

  set(jid, command, durationMs) {
    this._set().run({ key: `${jid}:${command}`, expiresAt: Math.floor((Date.now() + durationMs) / 1000) })
  }

  clear(jid, command) { this._delete().run(`${jid}:${command}`) }
  cleanup() { return this._cleanup().run().changes }
}

export const cooldownModel = new CooldownModel()

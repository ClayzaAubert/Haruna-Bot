import { db } from '#storage/connection.js'
import { lazyPrepare } from '#storage/lazy.js'

const DEFAULTS = {
  bot_name: null, bot_prefix: null, menu_url: 'https://github.com',
  menu_title: 'HarunaBot', menu_desc: 'WhatsApp Bot Framework',
  thumbnail_url: '', bot_status: 'online', maintenance: '0', footer_text: '',
}

class BotConfigModel {
  _get = lazyPrepare('SELECT value FROM bot_settings WHERE key = ?')
  _set = lazyPrepare('INSERT INTO bot_settings (key, value, updated_at) VALUES (@key, @value, unixepoch()) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()')
  _del = lazyPrepare('DELETE FROM bot_settings WHERE key = ?')
  _all = lazyPrepare('SELECT key, value FROM bot_settings ORDER BY key')

  get(key) {
    const row = this._get().get(key)
    return row?.value ?? DEFAULTS[key] ?? null
  }

  set(key, value) { this._set().run({ key, value: String(value) }) }
  reset(key) { this._del().run(key) }
  getAll() { return this._all().all() }

  getAllWithDefaults() {
    const rows = this._all().all()
    const result = { ...DEFAULTS }
    for (const { key, value } of rows) result[key] = value
    return result
  }

  isMaintenanceMode() { return this.get('maintenance') === '1' }

  getMenuConfig() {
    return {
      url: this.get('menu_url') ?? 'https://github.com',
      title: this.get('menu_title') ?? 'HarunaBot',
      desc: this.get('menu_desc') ?? 'WhatsApp Bot',
      thumbnailUrl: this.get('thumbnail_url') ?? '',
      footerText: this.get('footer_text') ?? '',
    }
  }
}

export const botConfigModel = new BotConfigModel()

import { db } from '#storage/connection.js'
import { lazyPrepare } from '#storage/lazy.js'

class GroupModel {
  _find = lazyPrepare('SELECT * FROM groups WHERE jid = ?')
  _ensure = lazyPrepare(`
    INSERT INTO groups (jid, name) VALUES (@jid, @name)
    ON CONFLICT(jid) DO UPDATE SET name = excluded.name, updated_at = unixepoch()
  `)

  find(jid) { return this._find().get(jid) ?? null }

  ensure(jid, name = '') {
    this._ensure().run({ jid, name })
    return this._find().get(jid)
  }

  update(jid, fields) {
    const allowed = ['name', 'prefix', 'welcome', 'welcome_msg', 'antilink', 'antiflood', 'nsfw', 'mute']
    const updates = Object.entries(fields)
      .filter(([k]) => allowed.includes(k))
      .map(([k]) => `${k} = @${k}`)
      .join(', ')
    if (!updates) return
    db.prepare(`UPDATE groups SET ${updates}, updated_at = unixepoch() WHERE jid = @jid`).run({ jid, ...fields })
  }

  isMuted(jid) { return (this._find().get(jid)?.mute ?? 0) === 1 }
  isNsfw(jid) { return (this._find().get(jid)?.nsfw ?? 0) === 1 }
  hasAntilink(jid) { return (this._find().get(jid)?.antilink ?? 0) === 1 }
  getPrefix(jid) { return this._find().get(jid)?.prefix ?? null }
}

export const groupModel = new GroupModel()

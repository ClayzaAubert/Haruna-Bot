import Database from 'better-sqlite3'
import { mkdir } from 'fs/promises'
import { resolve, dirname } from 'path'
import { logger } from '#helpers/logger.js'
import SETTINGS from '#environment/settings.js'

const AUTH_DB_PATH = resolve(SETTINGS.dbPath?.replace('.db', '_auth.db') ?? './data/harunabot_auth.db')

export async function useSQLiteAuthState(sessionId = 'default') {
  await mkdir(dirname(AUTH_DB_PATH), { recursive: true })

  const db = new Database(AUTH_DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('synchronous = NORMAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_creds (
      session_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL,
      PRIMARY KEY (session_id, key)
    );
    CREATE TABLE IF NOT EXISTS auth_keys (
      session_id TEXT NOT NULL, type TEXT NOT NULL, id TEXT NOT NULL, value TEXT NOT NULL,
      PRIMARY KEY (session_id, type, id)
    );
  `)

  const getCred = db.prepare('SELECT value FROM auth_creds WHERE session_id = ? AND key = ?')
  const setCred = db.prepare('INSERT INTO auth_creds (session_id, key, value) VALUES (?, ?, ?) ON CONFLICT DO UPDATE SET value = excluded.value')
  const getKey = db.prepare('SELECT value FROM auth_keys WHERE session_id = ? AND type = ? AND id = ?')
  const setKey = db.prepare('INSERT INTO auth_keys (session_id, type, id, value) VALUES (?, ?, ?, ?) ON CONFLICT DO UPDATE SET value = excluded.value')
  const delKeys = db.prepare('DELETE FROM auth_keys WHERE session_id = ? AND type = ? AND id = ?')

  const { initAuthCreds, BufferJSON } = await import('baileys')

  let creds = (() => {
    const row = getCred.get(sessionId, 'creds')
    if (!row) return null
    try { return JSON.parse(row.value) } catch { return null }
  })()

  if (!creds) {
    creds = initAuthCreds()
    setCred.run(sessionId, 'creds', JSON.stringify(creds, BufferJSON.replacer))
    logger.info({ sessionId }, 'Auth: new session created')
  }

  const keys = {
    get: async (type, ids) => {
      const data = {}
      for (const id of ids) {
        const row = getKey.get(sessionId, type, id)
        if (row) {
          try { data[id] = JSON.parse(row.value, BufferJSON.reviver) } catch { /* skip */ }
        }
      }
      return data
    },
    set: async (data) => {
      const upsertMany = db.transaction((entries) => {
        for (const { type, id, value } of entries) {
          if (value) setKey.run(sessionId, type, id, JSON.stringify(value, BufferJSON.replacer))
          else delKeys.run(sessionId, type, id)
        }
      })
      const entries = []
      for (const [type, ids] of Object.entries(data)) {
        for (const [id, value] of Object.entries(ids ?? {})) {
          entries.push({ type, id, value })
        }
      }
      upsertMany(entries)
    },
  }

  const saveCreds = () => {
    setCred.run(sessionId, 'creds', JSON.stringify(creds, BufferJSON.replacer))
  }

  const clearSession = db.transaction(() => {
    db.prepare('DELETE FROM auth_creds WHERE session_id = ?').run(sessionId)
    db.prepare('DELETE FROM auth_keys WHERE session_id = ?').run(sessionId)
    logger.warn({ sessionId }, 'Auth: session cleared')
  })

  logger.info({ sessionId, path: AUTH_DB_PATH }, 'Auth: SQLite store ready')
  return { state: { creds, keys }, saveCreds, clearSession }
}

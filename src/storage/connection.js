import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import SETTINGS from '#environment/settings.js'
import { logger } from '#helpers/logger.js'

const DB_PATH = resolve(SETTINGS.dbPath || './data/harunabot.db')
const dbDir = dirname(DB_PATH)
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })

export const db = new Database(DB_PATH)

export function configureDatabase() {
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('synchronous = NORMAL')
  db.pragma('cache_size = -32000')
  db.pragma('temp_store = MEMORY')
  logger.info({ path: DB_PATH }, 'Database connected')
}

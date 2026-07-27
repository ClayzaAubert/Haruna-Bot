import { configureDatabase } from './connection.js'
import { createSchema } from './definitions.js'
import { logger } from '#helpers/logger.js'

export async function initializeDatabase() {
  try {
    configureDatabase()
    createSchema()
    logger.info('Database initialized')
  } catch (err) {
    logger.fatal({ err }, 'Database initialization failed')
    throw err
  }
}

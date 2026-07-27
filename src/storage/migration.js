import { initializeDatabase } from './initializer.js'
import { logger } from '#helpers/logger.js'

await initializeDatabase()
logger.info('Migration complete')

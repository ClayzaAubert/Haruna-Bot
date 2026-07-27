import { fileURLToPath } from 'url'
import 'dotenv/config'
import { bootstrap } from '#boot/bootstrap.js'
import { logger } from '#helpers/logger.js'

const isMain = process.argv[1] === fileURLToPath(import.meta.url)

if (isMain) {
  bootstrap().catch(err => {
    logger.fatal({ err }, 'FATAL')
    process.exit(1)
  })
}

export { bootstrap } from '#boot/bootstrap.js'

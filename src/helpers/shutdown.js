import { db } from '#storage/connection.js'
import { orchestrator } from '#extensions/lifecycle/orchestrator.js'
import { logger } from '#helpers/logger.js'

let sockRef = null

export function setSocket(sock) {
  sockRef = sock
}

const FORCE_KILL_TIMEOUT = 8_000

export function setupShutdown() {
  let shuttingDown = false

  async function cleanup(signal) {
    if (shuttingDown) return
    shuttingDown = true

    logger.info(`[Shutdown] ${signal} received, cleaning up...`)

    const forceTimer = setTimeout(() => {
      process.stderr.write('[Shutdown] Force exit after timeout\n')
      process.exit(1)
    }, FORCE_KILL_TIMEOUT)

    if (sockRef) {
      try {
        sockRef.end(new Error('Process terminated'))
        sockRef.ws?.close()
      } catch {}
    }

    orchestrator.destroyAll()

    try { db.close() } catch (err) { process.stderr.write(`DB close error: ${err}\n`) }

    clearTimeout(forceTimer)
    process.exit(0)
  }

  process.on('SIGTERM', () => cleanup('SIGTERM'))
  process.on('SIGINT', () => cleanup('SIGINT'))
}

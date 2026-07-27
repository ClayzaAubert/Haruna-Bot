import pino from 'pino'
import pretty from 'pino-pretty'
import SETTINGS from '#environment/settings.js'

function plainLogger() {
  if (process.stdout.isTTY) {
    const stream = pretty({
      colorize: true,
      translateTime: 'SYS:HH:MM:ss',
      ignore: 'pid,hostname',
      messageFormat: '[{name}] {msg}',
    })
    return pino(
      { level: SETTINGS.logLevel, base: { name: 'harunabot' } },
      stream,
    )
  }

  return pino(
    { level: SETTINGS.logLevel, base: { name: 'harunabot' } },
    pino.destination({ dest: 1, sync: true }),
  )
}

async function makeLogger() {
  if (SETTINGS.dashTerminal && process.stdout.isTTY) {
    const { createLogStream } = await import('#tui/log-stream.js')
    const stream = createLogStream()
    return pino(
      { level: SETTINGS.logLevel, base: { name: 'harunabot' } },
      stream,
    )
  }

  return plainLogger()
}

export const logger = await makeLogger()

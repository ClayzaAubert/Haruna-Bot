import pino from 'pino'
import SETTINGS from '#environment/settings.js'

const isDev = process.env.NODE_ENV !== 'production'

async function makeLogger() {
  if (SETTINGS.dashTerminal) {
    const { createLogStream } = await import('#tui/log-stream.js')
    const stream = createLogStream()
    return pino(
      { level: SETTINGS.logLevel, base: { name: 'harunabot' } },
      stream,
    )
  }

  return pino({
    level: SETTINGS.logLevel,
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
            messageFormat: '[{name}] {msg}',
          },
        }
      : undefined,
    base: { name: 'harunabot' },
  })
}

export const logger = await makeLogger()

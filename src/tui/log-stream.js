import { Writable } from 'stream'
import { logBuffer } from '#tui/log-store.js'

const levelLabel = { 10: 'TRACE', 20: 'DEBUG', 30: 'INFO ', 40: 'WARN ', 50: 'ERROR', 60: 'FATAL' }

export function createLogStream() {
  return new Writable({
    write(chunk, enc, cb) {
      const raw = chunk.toString().trim()
      if (!raw) { cb(); return }

      for (const line of raw.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed) continue

        try {
          const obj = JSON.parse(trimmed)
          const time = new Date(obj.time).toLocaleTimeString('en-US', { hour12: false })
          const lvl = levelLabel[obj.level] || '?????'
          const name = obj.name || '-'
          const msg = obj.msg ?? ''

          let formatted = `[${time}] ${lvl} (${name}): ${msg}`

          const pid = obj.pid
          if (obj.hostname) {
            formatted = `[${time}] ${lvl} (${name}): ${msg}`
          }

          logBuffer.write(formatted)

          if (obj.err && obj.err.stack) {
            logBuffer.write('  ' + obj.err.stack)
          }
        } catch {
          logBuffer.write(trimmed)
        }
      }
      cb()
    },
  })
}

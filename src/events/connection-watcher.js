import { DisconnectReason } from 'baileys'
import fsp from 'fs/promises'
import { logger } from '#helpers/logger.js'
import SETTINGS from '#environment/settings.js'
import { RECONNECT_MAX_RETRIES, RECONNECT_INTERVAL } from '#environment/limits.js'

let retries = 0
let reconnectTimer = null
let everConnected = false

function getStatusCode(err) {
  if (!err) return 0
  if (typeof err.output?.statusCode === 'number') return err.output.statusCode
  if (typeof err.statusCode === 'number') return err.statusCode
  if (err.status && typeof err.status === 'number') return err.status
  if (err.httpCode && typeof err.httpCode === 'number') return err.httpCode
  if (err.code && typeof err.code === 'number') return err.code
  return 0
}

export async function onConnectionUpdate(update, restart, sock) {
  const { connection, lastDisconnect, receivedPendingNotifications, qr } = update

  if (receivedPendingNotifications && !sock?.authState?.creds?.myAppStateKeyId) {
    sock?.ev?.flush()
  }

  if (!SETTINGS.pairingNumber && qr) logger.info('QR Code ready')

  if (connection) logger.info('Connection: %s', connection)

  if (connection === 'open') {
    retries = 0
    everConnected = true
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    logger.info('WhatsApp Connected')
    try { await fsp.mkdir('./temp', { recursive: true }) } catch {}
    return
  }

  if (connection === 'close') {
    const statusCode = getStatusCode(lastDisconnect?.error)

    logger.warn({ statusCode, reason: resolveReason(statusCode) }, 'Connection closed')

    switch (statusCode) {
      case DisconnectReason.connectionClosed:
      case DisconnectReason.connectionLost:
      case DisconnectReason.timedOut:
      case 408:
      case 503:
        logger.warn('Connection lost, reconnecting...')
        return reconnect(restart)

      case DisconnectReason.restartRequired:
      case 428:
      case 515:
        logger.info('Restart required')
        return restart()

      case DisconnectReason.loggedOut:
      case 401:
        if (!everConnected) {
          logger.warn('Pairing expired, retrying...')
          if (reconnectTimer) clearTimeout(reconnectTimer)
          reconnectTimer = setTimeout(restart, 2000)
          return
        }
        logger.error('Session logged out')
        try { await fsp.rm(SETTINGS.sessionPath, { recursive: true, force: true }) } catch {}
        process.exit(1)

      case DisconnectReason.badSession:
      case DisconnectReason.forbidden:
      case 403:
        logger.error('WhatsApp banned / forbidden')
        try { await fsp.rm(SETTINGS.sessionPath, { recursive: true, force: true }) } catch {}
        process.exit(1)

      case DisconnectReason.multideviceMismatch:
      case 405:
        logger.error('Multi-device mismatch')
        try { await fsp.rm(SETTINGS.sessionPath, { recursive: true, force: true }) } catch {}
        process.exit(1)

      default:
        logger.warn('Unknown disconnect: %d', statusCode)
        return reconnect(restart)
    }
  }
}

async function reconnect(restart) {
  if (retries >= RECONNECT_MAX_RETRIES) {
    logger.fatal('Max reconnect reached')
    process.exit(1)
  }
  retries++
  const delay = RECONNECT_INTERVAL * retries
  logger.info('Reconnecting in %dms (%d/%d)', delay, retries, RECONNECT_MAX_RETRIES)
  if (reconnectTimer) clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => restart(), delay)
}

export function cleanupConnectionWatcher() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
}

function resolveReason(code) {
  const entry = Object.entries(DisconnectReason).find(([, v]) => v === code)
  return entry?.[0] ?? 'Unknown'
}

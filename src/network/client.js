import makeWASocket, { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from 'baileys'
import NodeCache from 'node-cache'
import { useAuthState } from './authenticator.js'
import { registerEvents } from '#events/registry.js'
import { logger } from '#helpers/logger.js'
import SETTINGS from '#environment/settings.js'
import { GROUP_CACHE_TTL } from '#environment/limits.js'

const groupCache = new NodeCache({ stdTTL: GROUP_CACHE_TTL / 1000, checkperiod: 120, useClones: false, maxKeys: 200 })
const msgStore = new Map()

const MSG_STORE_MAX = 100
export function storeMessage(msg) {
  if (!msg?.key?.id) return
  msgStore.set(msg.key.id, msg.message)
  while (msgStore.size > MSG_STORE_MAX) {
    const first = msgStore.keys().next().value
    if (!first) break
    msgStore.delete(first)
  }
}

export async function createClient() {
  const { state, saveCreds } = await useAuthState(SETTINGS.sessionPath)
  const { version } = await fetchLatestBaileysVersion()
  logger.debug({ version: version.join('.') }, 'WA version')

  const sock = makeWASocket({
    version,
    printQRInTerminal: !SETTINGS.pairingNumber,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger.child({ name: 'signal', level: 'silent' })),
    },
    logger: logger.child({ name: 'baileys' }),
    browser: Browsers.ubuntu('Chrome'),
    markOnlineOnConnect: false,
    syncFullHistory: false,
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: 60_000,
    keepAliveIntervalMs: 10_000,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => msgStore.get(key.id),
    cachedGroupMetadata: async (jid) => groupCache.get(jid) ?? undefined,
  })

  sock._saveCreds = saveCreds

  if (SETTINGS.pairingNumber && !sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const raw = await sock.requestPairingCode(SETTINGS.pairingNumber)
        const code = raw?.match(/.{1,4}/g)?.join('-') || raw || ''
        logger.info('Pairing code: %s', code)
      } catch (err) {
        logger.error({ err }, 'Failed to request pairing code')
      }
    }, 3000)
  }

  registerEvents(sock, createClient)

  sock.ev.on('groups.update', (updates) => {
    for (const update of updates) {
      const cached = groupCache.get(update.id)
      if (cached) groupCache.set(update.id, { ...cached, ...update })
    }
  })

  const orig = sock.groupMetadata.bind(sock)
  sock.groupMetadata = async (jid) => {
    const meta = await orig(jid)
    groupCache.set(jid, meta)
    return meta
  }

  return sock
}

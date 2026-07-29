import SETTINGS from '#environment/settings.js'
import { isLidUser } from './identifier.js'
import { logger } from './logger.js'

const ownerJids = new Set(SETTINGS.ownerNumber)

export function isOwnerJid(jid) {
  return jid ? ownerJids.has(jid) : false
}

export function addOwnerJid(jid) {
  if (jid && !ownerJids.has(jid)) {
    ownerJids.add(jid)
    logger.debug({ jid }, 'Owner JID added')
  }
}

export function getOwnerJids() {
  return [...ownerJids]
}

export async function resolveOwnerLids(sock) {
  if (!sock?.signalRepository?.lidMapping) return
  let resolved = 0
  for (const pnJid of SETTINGS.ownerNumber) {
    if (!pnJid.endsWith('@s.whatsapp.net')) continue
    try {
      const lid = await sock.signalRepository.lidMapping.getLIDForPN(pnJid)
      if (lid && isLidUser(lid) && !ownerJids.has(lid)) {
        ownerJids.add(lid)
        resolved++
      }
    } catch {
      logger.debug({ pnJid }, 'Owner LID not resolvable yet')
    }
  }
  if (resolved > 0) logger.info({ resolved }, 'Owner LIDs resolved')
}

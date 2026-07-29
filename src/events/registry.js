import { onMessagesUpsert } from './message-pipeline.js'
import { onConnectionUpdate } from './connection-watcher.js'
import { onGroupParticipantsUpdate } from './group-observer.js'
import { addOwnerJid } from '#helpers/owner.js'
import { logger } from '#helpers/logger.js'
import SETTINGS from '#environment/settings.js'

export function registerEvents(sock, createClient) {
  sock.ev.on('connection.update', (update) => {
    onConnectionUpdate(update, createClient, sock)
  })

  sock.ev.on('creds.update', sock._saveCreds)

  sock.ev.on('lid-mapping.update', (payload) => {
    try {
      const mappings = Array.isArray(payload) ? payload : (payload?.mappings ?? [])
      for (const entry of mappings) {
        if (!entry) continue
        const lid = entry.lid ?? entry.newLid ?? entry.key
        const pn = entry.pn ?? entry.phoneNumber ?? entry.value
        if (lid && pn) {
          if (SETTINGS.ownerNumber.includes(pn)) addOwnerJid(lid)
          if (SETTINGS.ownerNumber.includes(lid)) addOwnerJid(pn)
          logger.debug({ lid, pn }, 'LID mapping')
        }
      }
    } catch (err) {
      logger.warn({ err: err.message }, 'LID mapping parse error')
    }
  })

  sock.ev.on('messages.upsert', (payload) => {
    onMessagesUpsert(payload, sock)
  })

  sock.ev.on('messages.update', (updates) => {
    logger.trace({ count: updates.length }, 'messages.update')
  })

  sock.ev.on('messages.delete', (item) => {
    logger.trace({ item }, 'messages.delete')
  })

  sock.ev.on('messages.reaction', (reactions) => {
    if (Array.isArray(reactions)) logger.trace({ count: reactions.length }, 'messages.reaction')
  })

  sock.ev.on('group-participants.update', (payload) => {
    if (!payload) return
    onGroupParticipantsUpdate(payload, sock)
  })

  sock.ev.on('groups.update', (updates) => {
    if (Array.isArray(updates)) logger.trace({ count: updates.length }, 'groups.update')
  })

  sock.ev.on('call', (calls) => {
    if (Array.isArray(calls)) logger.debug({ count: calls.length }, 'call event')
  })

  logger.debug('Events registered')
}

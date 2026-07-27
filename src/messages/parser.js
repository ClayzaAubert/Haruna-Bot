import { getContentType, jidNormalizedUser, downloadMediaMessage } from 'baileys'
import { isStatus } from '#helpers/identifier.js'

const MEDIA_TYPES = new Set([
  'imageMessage', 'videoMessage', 'audioMessage',
  'documentMessage', 'stickerMessage', 'ptvMessage',
])

export function parseMessage(raw, sock) {
  if (!raw?.message) return null

  const jid = raw.key?.remoteJid
  if (!jid || isStatus(jid)) return null

  const fromMe = raw.key?.fromMe ?? false
  const isGroup = jid.endsWith('@g.us')
  const jidAlt = raw.key?.remoteJidAlt ?? null
  const participant = isGroup ? (raw.key?.participant ?? raw.participant ?? jid) : jid
  const participantAlt = raw.key?.participantAlt ?? null
  const sender = jidNormalizedUser(participant)
  const senderAlt = participantAlt ? jidNormalizedUser(participantAlt) : null

  const type = getContentType(raw.message)
  if (!type) return null

  const inner = unwrapMessage(raw.message, type)
  const innerType = getContentType(inner) ?? type
  const content = inner[innerType]
  const text = extractText(inner, innerType, content)
  const quoted = extractQuoted(raw, content, jid, sock)
  const mentions = content?.contextInfo?.mentionedJid ?? []

  return {
    key: raw.key, jid, jidAlt, sender, senderAlt, fromMe, isGroup,
    type: innerType, text,
    args: text ? text.trim().split(/\s+/).slice(1) : [],
    rawArgs: text ? text.trim().split(/\s+/).slice(1).join(' ') : '',
    quoted, mentions,
    isMedia: MEDIA_TYPES.has(innerType),
    message: raw.message, raw,
    pushName: raw.pushName ?? '',
    timestamp: Number(raw.messageTimestamp ?? 0) * 1000,
  }
}

function unwrapMessage(message, type) {
  if (type === 'ephemeralMessage') return message.ephemeralMessage?.message ?? message
  if (type === 'viewOnceMessage') return message.viewOnceMessage?.message ?? message
  if (type === 'viewOnceMessageV2') return message.viewOnceMessageV2?.message ?? message
  return message
}

function extractText(message, type, content) {
  switch (type) {
    case 'conversation': return message.conversation ?? ''
    case 'extendedTextMessage': return content?.text ?? ''
    case 'imageMessage': case 'videoMessage': case 'documentMessage': case 'audioMessage':
      return content?.caption ?? ''
    case 'buttonsResponseMessage': return content?.selectedButtonId ?? ''
    case 'listResponseMessage': return content?.singleSelectReply?.selectedRowId ?? ''
    case 'templateButtonReplyMessage': return content?.selectedId ?? ''
    default: return ''
  }
}

function extractQuoted(raw, content, jid, sock) {
  const ctx = content?.contextInfo
  if (!ctx?.quotedMessage) return null

  const qType = getContentType(ctx.quotedMessage)
  const qContent = ctx.quotedMessage[qType]

  return {
    key: { remoteJid: jid, id: ctx.stanzaId, participant: ctx.participant },
    sender: jidNormalizedUser(ctx.participant ?? jid),
    type: qType, message: ctx.quotedMessage,
    text: qContent?.text ?? qContent?.caption ?? ctx.quotedMessage?.conversation ?? '',
    isMedia: MEDIA_TYPES.has(qType),
    download: () => downloadMediaMessage({
      key: { remoteJid: jid, id: ctx.stanzaId, participant: ctx.participant },
      message: ctx.quotedMessage,
    }),
  }
}

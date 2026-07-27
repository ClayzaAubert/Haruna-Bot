import SETTINGS from '#environment/settings.js'

export function buildContext(s, sock) {
  return {
    sock, msg: s, raw: s.raw,
    jid: s.jid, sender: s.sender, fromMe: s.fromMe,
    isGroup: s.isGroup, isPrivate: !s.isGroup,
    text: s.text, args: s.args, rawArgs: s.rawArgs,
    quoted: s.quoted, mentions: s.mentions,
    pushName: s.pushName, timestamp: s.timestamp,

    isOwner: () => SETTINGS.ownerNumber.includes(s.sender) || (s.senderAlt && SETTINGS.ownerNumber.includes(s.senderAlt)),

    reply: (content, options = {}) => {
      const body = typeof content === 'string' ? { text: content } : content
      return sock.sendMessage(s.jid, { ...body, ...options }, { quoted: s.raw })
    },

    send: (content, options = {}) => {
      const body = typeof content === 'string' ? { text: content } : content
      return sock.sendMessage(s.jid, { ...body, ...options })
    },

    sendTo: (targetJid, content, options = {}) => {
      const body = typeof content === 'string' ? { text: content } : content
      return sock.sendMessage(targetJid, { ...body, ...options })
    },

    react: (emoji) => sock.sendMessage(s.jid, { react: { text: emoji, key: s.key } }),

    sendMedia: (type, data, caption = '', options = {}) =>
      sock.sendMessage(s.jid, {
        [type]: typeof data === 'string' ? { url: data } : data, caption, ...options,
      }, { quoted: s.raw }),

    sendLinkPreview: async (text, url, title, desc, thumbBuffer, quoted = null) => {
      const { prepareWAMessageMedia, generateWAMessageFromContent } = await import('baileys')
      const { imageMessage } = await prepareWAMessageMedia(
        { image: thumbBuffer },
        { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
      )
      const msg = {
        extendedTextMessage: {
          text: `${url}\n${text}`, matchedText: url, title,
          description: desc, previewType: 0,
          jpegThumbnail: imageMessage.jpegThumbnail || thumbBuffer,
          thumbnailDirectPath: imageMessage.directPath,
          thumbnailSha256: imageMessage.fileSha256,
          thumbnailEncSha256: imageMessage.fileEncSha256,
          mediaKey: imageMessage.mediaKey,
          mediaKeyTimestamp: imageMessage.mediaKeyTimestamp,
          thumbnailHeight: 523, thumbnailWidth: 1024,
        },
      }
      const result = await generateWAMessageFromContent(s.jid, msg, {
        quoted: quoted ?? s.raw, userJid: sock.user?.jid ?? sock.user?.id, upload: sock.waUploadToServer,
      })
      return sock.relayMessage(s.jid, result.message, { messageId: result.key.id })
    },

    deleteMessage: (msgKey = s.key) => sock.sendMessage(s.jid, { delete: msgKey }),
    downloadMedia: () => s.isMedia ? sock.downloadMediaMessage(s.raw) : Promise.resolve(null),
    typing: () => sock.sendPresenceUpdate('composing', s.jid),
    stopTyping: () => sock.sendPresenceUpdate('paused', s.jid),
    markRead: () => sock.readMessages([s.key]),
  }
}

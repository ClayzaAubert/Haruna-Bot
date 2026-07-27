import { jidNormalizedUser } from 'baileys'
import { parseMessage } from '#messages/parser.js'
import { dispatch } from '#messages/dispatcher.js'
import { logger } from '#helpers/logger.js'
import { isStatus } from '#helpers/identifier.js'
import { orchestrator } from '#extensions/lifecycle/orchestrator.js'
import { aiService } from '#features/ai.js'
import SETTINGS from '#environment/settings.js'

export async function onMessagesUpsert({ messages, type }, sock) {
  if (type !== 'notify') return

  for (const msg of messages) {
    try {
      if (!msg.message) continue
      if (isStatus(msg.key?.remoteJid)) continue

      const parsed = parseMessage(msg, sock)
      if (!parsed) continue
      if (parsed.fromMe && !SETTINGS.respondToSelf) continue

      logger.trace({ jid: parsed.jid, type: parsed.type }, 'Message received')

      const proceed = await orchestrator.runProcessors(parsed, sock)
      if (!proceed) continue

      const botId = jidNormalizedUser(sock.user?.id)
      const isMentioned = botId && parsed.mentions?.includes(botId)

      if (isMentioned && parsed.text && !parsed.text.startsWith(SETTINGS.prefix)) {
        if (aiService.isAvailable()) {
          const prompt = parsed.text.replace(new RegExp(`@${botId?.split('@')[0]}`, 'g'), '').trim()
          if (prompt) {
            try {
              const response = await aiService.chat(prompt)
              await sock.sendMessage(parsed.jid, { text: response }, { quoted: msg })
            } catch (err) {
              logger.warn({ err }, 'AI response failed')
            }
          }
        } else {
          await sock.sendMessage(parsed.jid, {
            text: `Halo! Ketik ${SETTINGS.prefix}help untuk lihat command.`,
          }, { quoted: msg })
        }
        continue
      }

      await dispatch(parsed, sock)

    } catch (err) {
      logger.error({ err, msgId: msg.key?.id }, 'Message handler error')
    }
  }
}

import { commandRegistry } from '#commands/registry.js'
import { buildContext } from '#messages/context.js'
import { runPipeline } from '#guards/pipeline.js'
import { groupModel, botConfigModel } from '#storage/models/index.js'
import { logger } from '#helpers/logger.js'
import SETTINGS from '#environment/settings.js'

const prefixPattern = () => new RegExp(`^[${escapeRegex(SETTINGS.prefix)}]`)

export async function dispatch(parsed, sock) {
  const { text, fromMe } = parsed
  if (!text) return
  if (fromMe && !SETTINGS.respondToSelf) return

  if (parsed.isGroup) {
    const group = groupModel.find(parsed.jid)
    if (group?.mute) return
  }

  if (!prefixPattern().test(text)) return

  const withoutPrefix = text.slice(SETTINGS.prefix.length).trim()
  if (!withoutPrefix) return

  const [commandName] = withoutPrefix.split(/\s+/)
  if (!commandName) return

  const command = commandRegistry.get(commandName.toLowerCase())
  if (!command) return

  const ctx = buildContext(parsed, sock)

  if (botConfigModel.isMaintenanceMode() && !ctx.isOwner()) {
    return ctx.reply('Bot sedang maintenance. Coba lagi nanti.').catch(() => {})
  }

  logger.debug({ command: command.name, sender: ctx.sender }, 'Command dispatched')

  try {
    if (!await runPipeline(ctx, command)) return
    await ctx.typing()
    await command.execute(ctx)
  } catch (err) {
    logger.error({ err, command: command.name, sender: ctx.sender }, 'Command error')
    await ctx.reply(`Error: ${err.message}`).catch(() => {})
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

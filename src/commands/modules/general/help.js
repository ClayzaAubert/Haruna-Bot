import axios from 'axios'
import { commandRegistry } from '#commands/registry.js'
import { botConfigModel } from '#storage/models/index.js'
import SETTINGS from '#environment/settings.js'

const CAT_ICONS = { general: '📋', economy: '💰', rpg: '⚔️', shop: '🛒', group: '👥', owner: '👑', downloader: '📥', utility: '🔧' }

export default {
  name: 'help',
  aliases: ['h', 'menu'],
  category: 'general',
  description: 'Lihat semua command yang tersedia',
  cooldown: 5_000,

  async execute(ctx) {
    const categories = commandRegistry.getCategories()
    const prefix = botConfigModel.get('bot_prefix') || SETTINGS.prefix
    const botName = botConfigModel.get('bot_name') || SETTINGS.botName
    const now = new Date().toLocaleString('id-ID', { timeZone: SETTINGS.timezone })
    const thumbUrl = botConfigModel.get('thumbnail_url')
    const footerText = botConfigModel.get('footer_text')

    let text = `╭━━━〔 *${botName}* 〕━━━╮\n`
    text += `┃ 🕐 ${now}\n`
    text += `┃ 📦 ${commandRegistry.count()} commands tersedia\n`
    text += `┃ 🔑 Prefix: \`${prefix}\`\n`
    text += `╰━━━━━━━━━━━━━━━━━━━╯\n\n`

    for (const cat of categories) {
      const cmds = commandRegistry.getByCategory(cat)
      if (!cmds.length) continue
      const icon = CAT_ICONS[cat] ?? '📁'
      text += `${icon} *${cat.toUpperCase()}*\n`
      for (const cmd of cmds) text += `  ┗ \`${prefix}${cmd.name}\` — ${cmd.description ?? 'No description'}\n`
      text += '\n'
    }
    if (footerText) text += `_${footerText}_\n`
    text = text.trimEnd()

    if (thumbUrl) {
      try {
        const { data } = await axios.get(thumbUrl, { responseType: 'arraybuffer', timeout: 10_000 })
        const buf = Buffer.from(data)
        const settings = botConfigModel.getMenuConfig() ?? {}
        await ctx.sendLinkPreview(text, settings.url, settings.title, settings.desc, buf)
        return
      } catch {}
    }

    await ctx.reply(text)
  },
}

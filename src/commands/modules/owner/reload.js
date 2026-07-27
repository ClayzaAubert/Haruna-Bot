import { reloadCommand } from '#commands/loader.js'
import { logger } from '#helpers/logger.js'
import { existsSync } from 'fs'
import { join } from 'path'

export default {
  name: 'reload',
  aliases: ['rl', 'restart'],
  category: 'owner',
  description: 'Reload command atau restart bot',
  cooldown: 0, ownerOnly: true,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()

    if (sub === 'all' || sub === 'commands') {
      const { loadCommands } = await import('#commands/loader.js')
      await loadCommands()
      return ctx.reply('✅ Semua command di-reload.')
    }

    if (sub === 'plugins' || sub === 'extensions') {
      const { loadExtensions } = await import('#commands/loader.js')
      await loadExtensions()
      return ctx.reply('✅ Ekstensi di-reload.')
    }

    if (sub === 'bot' || sub === 'hard') {
      await ctx.reply('🔄 Merestart bot...')
      process.exit(0)
      return
    }

    if (sub) {
      const baseDir = join(process.cwd(), 'src/commands/modules')
      const categories = ['general', 'owner', 'group', 'economy', 'rpg', 'shop', 'utility', 'downloader']

      for (const cat of categories) {
        const file = join(baseDir, cat, `${sub}.js`)
        if (existsSync(file)) {
          const ok = await reloadCommand(file)
          return ctx.reply(ok ? `✅ Command \`${sub}\` di-reload.` : `❌ Gagal reload \`${sub}\`.`)
        }
      }
      return ctx.reply(`❌ Command \`${sub}\` tidak ditemukan.`)
    }

    return ctx.reply('Usage: `!reload <command>` | `!reload all` | `!reload bot`')
  },
}

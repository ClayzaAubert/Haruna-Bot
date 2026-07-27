import { F } from '#helpers/index.js'
import { commandRegistry } from '#commands/registry.js'
import SETTINGS from '#environment/settings.js'

const startTime = Date.now()

export default {
  name: 'info',
  aliases: ['about', 'botinfo'],
  category: 'general',
  description: 'Informasi tentang bot',
  cooldown: 10_000,

  async execute(ctx) {
    const uptime = F.formatDuration(Date.now() - startTime)
    const mem = process.memoryUsage()
    const memMB = (mem.heapUsed / 1024 / 1024).toFixed(1)

    const text = [
      `*🤖 ${SETTINGS.botName}*`,
      '',
      `⏱ Uptime: *${uptime}*`,
      `💾 Memory: *${memMB} MB*`,
      `📦 Commands: *${commandRegistry.count()}*`,
      `🟢 Status: *Online*`,
    ].join('\n')

    await ctx.reply(text)
  },
}

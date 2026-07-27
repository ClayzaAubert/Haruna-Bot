import { botConfigModel } from '#storage/models/index.js'

export default {
  name: 'botsetting',
  aliases: ['botset', 'setbot'],
  category: 'owner',
  description: 'Atur pengaturan bot',
  cooldown: 0, ownerOnly: true,

  async execute(ctx) {
    const key = ctx.args[0]
    const value = ctx.rawArgs.replace(/^\S+\s+/, '')

    if (!key) {
      const all = botConfigModel.getAll()
      const text = Object.entries(all).map(([k, v]) => `*${k}*: ${v || '(kosong)'}`).join('\n')
      return ctx.reply(`⚙️ *Bot Settings*\n\n${text || 'Belum ada setting.'}`)
    }

    if (!value) return ctx.reply('Usage: `!botsetting <key> <value>`')
    botConfigModel.set(key, value)
    await ctx.reply(`✅ *${key}* diupdate ke: ${value}`)
  },
}

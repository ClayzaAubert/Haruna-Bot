import { userModel } from '#storage/models/index.js'
import { phoneToJid } from '#helpers/identifier.js'

export default {
  name: 'premium',
  aliases: ['addprem', 'delprem'],
  category: 'owner',
  description: 'Manage premium user',
  cooldown: 0, ownerOnly: true,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()
    const targetJid = ctx.mentions[0] ?? (ctx.args[1] ? phoneToJid(ctx.args[1]) : ctx.sender)

    if (sub === 'add') {
      const duration = parseInt(ctx.args[2]) || 30
      userModel.ensure(targetJid)
      userModel.setPremium(targetJid, duration * 24 * 60 * 60 * 1000)
      return ctx.reply(`✅ @${targetJid.split('@')[0]} dapat premium ${duration} hari.`, { mentions: [targetJid] })
    }

    if (sub === 'del' || sub === 'remove') {
      userModel.removePremium(targetJid)
      return ctx.reply(`✅ Premium @${targetJid.split('@')[0]} dicabut.`, { mentions: [targetJid] })
    }

    return ctx.reply('Usage: `!premium add <@tag> [hari]` | `!premium del <@tag>`')
  },
}

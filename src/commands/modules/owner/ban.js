import { userModel } from '#storage/models/index.js'
import { phoneToJid } from '#helpers/identifier.js'

export default {
  name: 'ban',
  aliases: ['unban', 'listban'],
  category: 'owner',
  description: 'Ban/unban user dari pakai bot',
  cooldown: 0, ownerOnly: true,

  async execute(ctx) {
    const isListban = ctx.args[0] === 'list' || ctx.msg.text?.includes('listban')

    if (isListban) {
      const { db } = await import('#storage/connection.js')
      const banned = db.prepare('SELECT jid, push_name FROM users WHERE banned = 1').all()
      if (!banned.length) return ctx.reply('✅ Tidak ada user yang dibanned.')
      const list = banned.map((u, i) => `${i + 1}. ${u.push_name || u.jid.split('@')[0]}`).join('\n')
      return ctx.reply(`🚫 *Banned Users (${banned.length})*\n\n${list}`)
    }

    const targetJid = ctx.mentions[0] ?? (ctx.args[0] ? phoneToJid(ctx.args[0]) : null)
    if (!targetJid) return ctx.reply('Usage: `!ban @tag` | `!unban @tag` | `!listban`')
    if (targetJid === ctx.sender) return ctx.reply('❌ Tidak bisa ban diri sendiri.')

    const isUnban = ctx.msg.text?.includes('unban')
    if (isUnban) {
      userModel.unban(targetJid)
      await ctx.reply(`✅ @${targetJid.split('@')[0]} berhasil di-unban.`, { mentions: [targetJid] })
    } else {
      userModel.ensure(targetJid)
      userModel.ban(targetJid)
      await ctx.reply(`🚫 @${targetJid.split('@')[0]} berhasil di-ban.`, { mentions: [targetJid] })
    }
  },
}

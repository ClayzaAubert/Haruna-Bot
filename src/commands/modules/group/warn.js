import { db } from '#storage/connection.js'
import { phoneToJid } from '#helpers/identifier.js'
import { logger } from '#helpers/logger.js'

const MAX_WARNS = 3

export default {
  name: 'warn',
  aliases: ['peringatan', 'warning'],
  category: 'group',
  description: 'Warn member grup',
  cooldown: 5_000, groupOnly: true, adminOnly: true,

  async execute(ctx) {
    const targetJid = ctx.mentions[0] ?? (ctx.args[0] ? phoneToJid(ctx.args[0]) : null)
    if (!targetJid) return ctx.reply('Usage: `!warn @tag`')
    if (targetJid === ctx.sender) return ctx.reply('Tidak bisa warn diri sendiri.')

    const reason = ctx.rawArgs.replace(/@\S+/g, '').trim() || 'no reason'

    db.prepare(`
      INSERT INTO warns (jid, group_jid, reason) VALUES (?, ?, ?)
    `).run(targetJid, ctx.jid, reason)

    const count = db.prepare(`SELECT COUNT(*) as c FROM warns WHERE jid = ? AND group_jid = ?`).get(targetJid, ctx.jid).c

    if (count >= MAX_WARNS) {
      try {
        await ctx.sock.groupParticipantsUpdate(ctx.jid, [targetJid], 'remove')
      } catch (err) {
        logger.warn({ err }, 'Failed to kick warned user')
      }
      db.prepare(`DELETE FROM warns WHERE jid = ? AND group_jid = ?`).run(targetJid, ctx.jid)
      await ctx.reply(`@${targetJid.split('@')[0]} mendapat ${MAX_WARNS} warn dan di-kick!`, { mentions: [targetJid] })
    } else {
      await ctx.reply(`@${targetJid.split('@')[0]} di-warn (${count}/${MAX_WARNS})`, { mentions: [targetJid] })
    }
  },
}

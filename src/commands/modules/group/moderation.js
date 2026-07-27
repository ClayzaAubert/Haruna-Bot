function normalizeJid(j = '') { return j.replace(/:\d+(?=@)/, '') }

export const kickCommand = {
  name: 'kick',
  aliases: ['keluarkan', 'remove'],
  category: 'group',
  description: 'Kick member dari grup',
  cooldown: 5_000, groupOnly: true, adminOnly: true,

  async execute(ctx) {
    const targets = ctx.mentions.length ? ctx.mentions : null
    if (!targets) return ctx.reply('Usage: `!kick @tag`')
    for (const jid of targets) {
      if (jid === ctx.sender) return ctx.reply('❌ Tidak bisa kick diri sendiri.')
      try { await ctx.sock.groupParticipantsUpdate(ctx.jid, [jid], 'remove') } catch (err) { return ctx.reply(`❌ ${err.message}`) }
    }
    const names = targets.map(j => `@${j.split('@')[0]}`).join(', ')
    await ctx.reply(`✅ ${names} berhasil di-kick.`, { mentions: targets })
  },
}

export const promoteCommand = {
  name: 'promote',
  aliases: ['jadiadmin', 'promot'],
  category: 'group',
  description: 'Jadikan member sebagai admin',
  cooldown: 5_000, groupOnly: true, adminOnly: true,

  async execute(ctx) {
    const targets = ctx.mentions.length ? ctx.mentions : null
    if (!targets) return ctx.reply('Usage: `!promote @tag`')
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.jid, targets, 'promote')
      const names = targets.map(j => `@${j.split('@')[0]}`).join(', ')
      await ctx.reply(`✅ ${names} sekarang jadi admin!`, { mentions: targets })
    } catch (err) { await ctx.reply(`❌ ${err.message}`) }
  },
}

export const demoteCommand = {
  name: 'demote',
  aliases: ['cabutadmin', 'turunkan'],
  category: 'group',
  description: 'Cabut status admin member',
  cooldown: 5_000, groupOnly: true, adminOnly: true,

  async execute(ctx) {
    const targets = ctx.mentions.length ? ctx.mentions : null
    if (!targets) return ctx.reply('Usage: `!demote @tag`')
    try {
      await ctx.sock.groupParticipantsUpdate(ctx.jid, targets, 'demote')
      const names = targets.map(j => `@${j.split('@')[0]}`).join(', ')
      await ctx.reply(`✅ Admin ${names} dicabut.`, { mentions: targets })
    } catch (err) { await ctx.reply(`❌ ${err.message}`) }
  },
}

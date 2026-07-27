export default {
  name: 'tagall',
  aliases: ['everyone', 'tag', 'all'],
  category: 'group',
  description: 'Tag semua member grup',
  cooldown: 5_000, groupOnly: true, adminOnly: true,

  async execute(ctx) {
    let meta
    try {
      meta = await ctx.sock.groupMetadata(ctx.jid)
    } catch {
      return ctx.reply('Gagal mengambil data grup.')
    }
    const participants = meta.participants
    const mentions = participants.map(p => p.id)
    const text = ctx.rawArgs || '📢 @all'

    const chunked = []
    for (let i = 0; i < mentions.length; i += 30) {
      chunked.push(mentions.slice(i, i + 30))
    }

    for (const chunk of chunked) {
      await ctx.reply(text, { mentions: chunk })
    }
  },
}

export default {
  name: 'groupinfo',
  aliases: ['ginfo', 'infogrup'],
  category: 'group',
  description: 'Lihat informasi grup',
  cooldown: 5_000, groupOnly: true,

  async execute(ctx) {
    let meta
    try {
      meta = await ctx.sock.groupMetadata(ctx.jid)
    } catch {
      return ctx.reply('Gagal mengambil data grup.')
    }
    const admins = meta.participants.filter(p => p.admin).length
    const text = [
      `👥 *${meta.subject}*`,
      '',
      `🆔 ${meta.id}`,
      `👤 Member: ${meta.participants.length}`,
      `👑 Admin: ${admins}`,
      `📅 Dibuat: ${new Date(meta.creation * 1000).toLocaleDateString('id-ID')}`,
      `📝 ${meta.desc || 'Tidak ada deskripsi'}`,
    ].join('\n')

    await ctx.reply(text)
  },
}

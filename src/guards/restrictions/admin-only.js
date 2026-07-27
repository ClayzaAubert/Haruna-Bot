export async function checkAdmin(ctx, command) {
  if (!command.adminOnly) return true

  if (!ctx.isGroup) {
    await ctx.reply('Command ini hanya bisa dipakai di grup.')
    return false
  }

  if (ctx.isOwner()) return true

  try {
    const meta = await ctx.sock.groupMetadata(ctx.jid)
    const admins = meta.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id)

    if (admins.includes(ctx.sender)) return true

    await ctx.reply('Command ini khusus admin grup.')
    return false
  } catch {
    await ctx.reply('Gagal memeriksa status admin.')
    return false
  }
}

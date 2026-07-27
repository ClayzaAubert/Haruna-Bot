export async function checkOwner(ctx, command) {
  if (!command.ownerOnly) return true
  if (ctx.isOwner()) return true
  await ctx.reply('Command ini khusus owner bot.')
  return false
}

export async function checkPrivate(ctx, command) {
  if (!command.privateOnly) return true
  if (ctx.isPrivate) return true
  await ctx.reply('Command ini hanya bisa dipakai di chat pribadi.')
  return false
}

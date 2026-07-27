import { userModel } from '#storage/models/index.js'

export async function checkPremium(ctx, command) {
  if (!command.premiumOnly) return true
  if (ctx.isOwner()) return true

  userModel.checkPremiumExpiry(ctx.sender)
  const user = userModel.findById(ctx.sender)

  if (user?.premium) return true

  await ctx.reply('Command ini khusus member Premium. Beli premium di !shop')
  return false
}

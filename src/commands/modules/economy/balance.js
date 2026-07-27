import { userModel, walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

export default {
  name: 'balance',
  aliases: ['bal', 'saldo', 'dompet'],
  category: 'economy',
  description: 'Lihat saldo kamu',
  cooldown: 5_000,

  async execute(ctx) {
    const user = userModel.ensure(ctx.sender, { pushName: ctx.pushName })
    const wallet = walletModel.find(ctx.sender)
    const total = (wallet?.cash ?? 0) + (wallet?.bank ?? 0)

    const text = [
      `💰 *Dompet ${user.push_name || 'Kamu'}*`,
      '',
      `🪙 Cash  : *${F.formatNumber(wallet?.cash ?? 0)}*`,
      `🏦 Bank  : *${F.formatNumber(wallet?.bank ?? 0)}* / ${F.formatNumber(wallet?.bank_limit ?? 10000)}`,
      `📊 Total : *${F.formatNumber(total)}*`,
      `⭐ Level : *${user.level}* (${F.formatNumber(user.exp)} / ${F.formatNumber(userModel.expForLevel(user.level + 1))} EXP)`,
    ].join('\n')

    await ctx.reply(text)
  },
}

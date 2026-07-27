import { walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

export default {
  name: 'bank',
  aliases: ['deposit', 'withdraw', 'tabung', 'ambil'],
  category: 'economy',
  description: 'Deposit atau withdraw uang dari bank',
  cooldown: 5_000,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()
    const amount = parseInt(ctx.args[1]) || 0
    if (!amount || amount <= 0) return ctx.reply('Usage: `!bank deposit/withdraw <amount>`')

    try {
      if (sub === 'deposit' || sub === 'tabung') {
        walletModel.deposit(ctx.sender, amount)
        const wallet = walletModel.find(ctx.sender)
        await ctx.reply(`✅ Deposit *${F.formatNumber(amount)}* ke bank berhasil!\n🏦 Bank: *${F.formatNumber(wallet.bank)}* / ${F.formatNumber(wallet.bank_limit)}`)
      } else if (sub === 'withdraw' || sub === 'ambil') {
        walletModel.withdraw(ctx.sender, amount)
        await ctx.reply(`✅ Withdraw *${F.formatNumber(amount)}* dari bank berhasil!`)
      } else {
        await ctx.reply('Usage: `!bank deposit <amount>` atau `!bank withdraw <amount>`')
      }
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

import { walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

export default {
  name: 'coinflip',
  aliases: ['cf', 'flip', 'toss'],
  category: 'economy',
  description: 'Main tebak koin',
  cooldown: 5_000,

  async execute(ctx) {
    const side = ctx.args[0]?.toLowerCase()
    const bet = parseInt(ctx.args[1]) || 0

    if (!side || !['heads', 'tails', 'kepala', 'ekor'].includes(side)) return ctx.reply('Usage: `!coinflip <heads/tails> <bet>`')
    if (bet < 100) return ctx.reply('Minimal taruhan: 🪙100')

    const wallet = walletModel.find(ctx.sender)
    if (!wallet || wallet.cash < bet) return ctx.reply('Saldo cash tidak cukup.')

    walletModel.addCash(ctx.sender, -bet)

    const result = Math.random() < 0.5 ? 'kepala' : 'ekor'
    const userChoice = { heads: 'kepala', tails: 'ekor', kepala: 'kepala', ekor: 'ekor' }[side]
    const won = result === userChoice

    if (won) {
      walletModel.addCash(ctx.sender, bet * 2)
      await ctx.reply(`🪙 *COINFLIP*\n\nHasil: *${result.toUpperCase()}*\n\n✨ *WIN!* Kamu dapat *${F.formatNumber(bet * 2)}*!`)
    } else {
      await ctx.reply(`🪙 *COINFLIP*\n\nHasil: *${result.toUpperCase()}*\n\n😔 *Kalah* — ${F.formatNumber(bet)} hangus.`)
    }
  },
}

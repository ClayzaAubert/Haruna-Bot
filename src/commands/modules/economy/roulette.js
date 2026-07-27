import { walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

const COLORS = ['🔴', '⚫', '🟢']
const COLOR_MULT = { '🔴': 2, '⚫': 2, '🟢': 14 }

export default {
  name: 'roulette',
  aliases: ['roul', 'roda'],
  category: 'economy',
  description: 'Main roulette — tebak warna',
  cooldown: 5_000,

  async execute(ctx) {
    const color = ctx.args[0]
    const bet = parseInt(ctx.args[1]) || 0

    if (!color || !['red', 'black', 'green'].includes(color.toLowerCase())) return ctx.reply('Usage: `!roulette <red/black/green> <bet>`')
    if (bet < 100) return ctx.reply('Minimal taruhan: 🪙100')

    const wallet = walletModel.find(ctx.sender)
    if (!wallet || wallet.cash < bet) return ctx.reply('Saldo cash tidak cukup.')

    walletModel.addCash(ctx.sender, -bet)

    const result = COLORS[Math.floor(Math.random() * COLORS.length)]
    const userColor = { red: '🔴', black: '⚫', green: '🟢' }[color.toLowerCase()]
    const won = result === userColor

    let msg = `🎡 *ROULETTE*\n\nHasil: ${result}\n`
    if (won) {
      const mult = COLOR_MULT[result]
      const win = bet * mult
      walletModel.addCash(ctx.sender, win)
      msg += `✨ *WIN!* Kamu dapat *${F.formatNumber(win)}*!`
    } else {
      msg += `😔 *Kalah* — ${F.formatNumber(bet)} hangus.`
    }

    await ctx.reply(msg)
  },
}

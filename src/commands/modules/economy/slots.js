import { walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣']
const PAYOUTS = { '7️⃣7️⃣7️⃣': 10, '💎💎💎': 8, '🍇🍇🍇': 5, '🍊🍊🍊': 4, '🍋🍋🍋': 3, '🍒🍒🍒': 2 }
const MIN_BET = 100

export default {
  name: 'slots',
  aliases: ['slot', 'mesin'],
  category: 'economy',
  description: 'Main mesin slot',
  cooldown: 5_000,

  async execute(ctx) {
    const bet = parseInt(ctx.args[0]) || 100
    if (bet < MIN_BET) return ctx.reply(`Minimal taruhan: 🪙${F.formatNumber(MIN_BET)}`)

    const wallet = walletModel.find(ctx.sender)
    if (!wallet || wallet.cash < bet) return ctx.reply('Saldo cash tidak cukup.')

    walletModel.addCash(ctx.sender, -bet)

    const a = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    const b = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    const c = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]

    const line = `${a} | ${b} | ${c}`
    const key = `${a}${b}${c}`
    const mult = PAYOUTS[key] ?? 0
    const win = bet * mult

    if (win > 0) {
      walletModel.addCash(ctx.sender, win)
      await ctx.reply(`🎰 *SLOTS*\n\n${line}\n\n✨ *JACKPOT!* Kamu menang *${F.formatNumber(win)}*! (${mult}x)`)
    } else {
      await ctx.reply(`🎰 *SLOTS*\n\n${line}\n\n😔 Sayang... Coba lagi!`)
    }
  },
}

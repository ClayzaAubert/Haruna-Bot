import { walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'
import { phoneToJid } from '#helpers/identifier.js'

const TAX_RATE = 0.05

export default {
  name: 'transfer',
  aliases: ['tf', 'kirim'],
  category: 'economy',
  description: 'Kirim uang ke user lain',
  cooldown: 10_000,

  async execute(ctx) {
    const targetJid = ctx.mentions[0] ?? (ctx.args[0] ? phoneToJid(ctx.args[0]) : null)
    const amount = parseInt(ctx.args.find(a => /^\d+$/.test(a)) ?? ctx.args[1])

    if (!targetJid || !amount || amount <= 0) return ctx.reply('Usage: `!transfer @tag <amount>`')
    if (targetJid === ctx.sender) return ctx.reply('❌ Tidak bisa transfer ke diri sendiri.')

    const tax = Math.floor(amount * TAX_RATE)
    const total = amount + tax

    try {
      walletModel.transfer(ctx.sender, targetJid, total, 'transfer')
      await ctx.reply(`✅ Transfer *${F.formatNumber(amount)}* ke @${targetJid.split('@')[0]} berhasil!\n💰 Pajak: *${F.formatNumber(tax)}*`, { mentions: [targetJid] })
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

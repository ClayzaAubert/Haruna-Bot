import { walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

export default {
  name: 'history',
  aliases: ['riwayat', 'transaksi'],
  category: 'economy',
  description: 'Lihat riwayat transaksi',
  cooldown: 5_000,

  async execute(ctx) {
    const txs = walletModel.history(ctx.sender, 10)
    if (!txs.length) return ctx.reply('📄 Belum ada transaksi.')

    let text = '📄 *Riwayat Transaksi*\n\n'
    for (const tx of txs) {
      const arrow = tx.from_jid === ctx.sender ? '➡️' : '⬅️'
      const date = new Date(tx.created_at * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
      text += `${arrow} ${tx.type}: 🪙${F.formatNumber(tx.amount)}\n  _${date}_\n`
    }

    await ctx.reply(text)
  },
}

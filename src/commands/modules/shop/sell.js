import { shopService } from '#features/economy/shop.js'
import { F } from '#helpers/index.js'

export default {
  name: 'sell',
  aliases: ['jual'],
  category: 'shop',
  description: 'Jual item ke toko',
  cooldown: 5_000,

  async execute(ctx) {
    const itemId = ctx.args[0]
    const qty = parseInt(ctx.args[1]) || 1
    if (!itemId) return ctx.reply('Usage: `!sell <item_id> [jumlah]`')

    try {
      const { earned } = shopService.sell(ctx.sender, itemId, qty)
      await ctx.reply(`💰 *Penjualan Berhasil!*\n🪙 +${F.formatNumber(earned)}`)
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

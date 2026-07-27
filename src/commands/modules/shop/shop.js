import { shopService } from '#features/economy/shop.js'
import { userModel, walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

const RARITY_EMOJI = { common: '⬜', uncommon: '🟩', rare: '🟦', epic: '🟪', legendary: '🟨' }

export default {
  name: 'shop',
  aliases: ['toko', 'store'],
  category: 'shop',
  description: 'Lihat & beli item di toko',
  cooldown: 5_000,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()

    if (sub === 'buy' || sub === 'beli') {
      const itemId = ctx.args[1]
      const qty = parseInt(ctx.args[2]) || 1
      if (!itemId) return ctx.reply('Usage: `!shop buy <item_id> [jumlah]`')
      userModel.ensure(ctx.sender, { pushName: ctx.pushName })
      try {
        const { total } = shopService.buy(ctx.sender, itemId, qty)
        const wallet = walletModel.find(ctx.sender)
        return ctx.reply(`🛒 *Pembelian Berhasil!*\n📦 ×${qty}\n🪙 -${F.formatNumber(total)}\n💰 Sisa: ${F.formatNumber(wallet?.cash ?? 0)}`)
      } catch (err) { return ctx.reply(`❌ ${err.message}`) }
    }

    const grouped = shopService.getShopItems()
    const wallet = walletModel.find(ctx.sender)
    let text = `🏪 *Toko HarunaBot*\n${wallet ? `💰 Cash: *${F.formatNumber(wallet.cash)}*\n\n` : '\n'}`

    for (const [cat, items] of Object.entries(grouped)) {
      text += `*[ ${cat.toUpperCase()} ]*\n`
      items.forEach(item => {
        const emoji = RARITY_EMOJI[item.rarity] ?? '⬜'
        text += `${emoji} \`${item.id}\`\n  *${item.name}* — 🪙${F.formatNumber(item.price)}\n  _${item.description}_\n`
      })
      text += '\n'
    }
    text += '_Beli: !shop buy <id> [jumlah]_'
    await ctx.reply(text.trimEnd())
  },
}

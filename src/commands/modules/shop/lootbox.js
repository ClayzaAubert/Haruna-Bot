import { lootboxService } from '#features/economy/lootbox.js'

const RARITY_EMOJI = { common: '⬜', uncommon: '🟩', rare: '🟦', epic: '🟪', legendary: '🟨' }

export default {
  name: 'lootbox',
  aliases: ['lb', 'gacha', 'buka'],
  category: 'shop',
  description: 'Buka lootbox untuk dapat item random',
  cooldown: 5_000,

  async execute(ctx) {
    try {
      const result = lootboxService.open(ctx.sender)
      const emoji = RARITY_EMOJI[result.rarity] ?? '🎁'
      const newBadge = result.isNew ? ' 🆕' : ''
      await ctx.reply(`🎉 *Lootbox Opened!*\n\n${emoji} *${result.item.name}* (${result.rarity})${newBadge}`)
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

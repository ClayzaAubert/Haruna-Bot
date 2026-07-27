import { shopService } from '#features/economy/shop.js'
import { userModel } from '#storage/models/index.js'

export default {
  name: 'equip',
  aliases: ['pakai', 'unequip', 'lepas'],
  category: 'shop',
  description: 'Equip/unequip weapon atau armor',
  cooldown: 5_000,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()
    const itemId = ctx.args[1]

    if (!sub || (sub !== 'unequip' && !itemId)) return ctx.reply('Usage: `!equip <item_id>` | `!equip unequip <weapon/armor>`')

    userModel.ensure(ctx.sender, { pushName: ctx.pushName })
    const user = userModel.findById(ctx.sender)

    try {
      if (sub === 'unequip' || sub === 'lepas') {
        const slot = itemId || ctx.args[0]
        const result = shopService.unequip(ctx.sender, slot, user.level)
        await ctx.reply(`✅ *${slot}* dilepas. ATK: ${result.atk}, DEF: ${result.def}, HP: ${result.maxHp}`)
      } else {
        const result = shopService.equip(ctx.sender, sub, user.level)
        await ctx.reply(`✅ *${result.item.name}* dipasang! ATK: ${result.atk}, DEF: ${result.def}, HP: ${result.maxHp}`)
      }
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

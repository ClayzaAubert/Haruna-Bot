import { userModel, walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

const FISH = [
  { name: 'Ikan Lele', reward: [200, 500], exp: 8, emoji: '🐟' },
  { name: 'Ikan Mas', reward: [300, 700], exp: 10, emoji: '🐠' },
  { name: 'Ikan Cupang', reward: [500, 1000], exp: 15, emoji: '🐡' },
  { name: 'Ikan Arwana', reward: [2000, 5000], exp: 40, emoji: '🐉' },
  { name: 'Sepatu Bekas', reward: [10, 50], exp: 2, emoji: '👟' },
  { name: 'Botol Plastik', reward: [5, 20], exp: 1, emoji: '🧴' },
]

export default {
  name: 'fish',
  aliases: ['fishing', 'pancing', 'mancing'],
  category: 'rpg',
  description: 'Pancing ikan untuk dapat uang',
  cooldown: 30_000,

  async execute(ctx) {
    userModel.ensure(ctx.sender, { pushName: ctx.pushName })
    const catchResult = FISH[Math.floor(Math.random() * FISH.length)]
    const reward = Math.floor(catchResult.reward[0] + Math.random() * (catchResult.reward[1] - catchResult.reward[0]))

    walletModel.reward(ctx.sender, reward, `fish: ${catchResult.name}`)
    const { leveledUp, newLevel } = userModel.addExp(ctx.sender, catchResult.exp)

    let text = `🎣 *Fishing!*\n\n${catchResult.emoji} Kamu dapat: *${catchResult.name}*\n🪙 +${F.formatNumber(reward)}\n⭐ +${catchResult.exp} EXP`
    if (leveledUp) text += `\n\n🎉 *LEVEL UP!* Kamu sekarang level *${newLevel}*!`
    await ctx.reply(text)
  },
}

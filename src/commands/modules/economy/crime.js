import { userModel, walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

const CRIMES = [
  { name: 'jambret', reward: [2000, 5000], penalty: [1000, 3000], exp: 25 },
  { name: 'skimming ATM', reward: [5000, 10000], penalty: [3000, 8000], exp: 40 },
  { name: 'judi online', reward: [1500, 4000], penalty: [500, 2000], exp: 20 },
  { name: 'copet', reward: [1000, 3000], penalty: [500, 1500], exp: 15 },
  { name: 'hacker', reward: [4000, 8000], penalty: [2000, 6000], exp: 35 },
]

export default {
  name: 'crime',
  aliases: ['kejahatan', 'jahat'],
  category: 'economy',
  description: 'Lakukan kejahatan (resiko tinggi)',
  cooldown: 60 * 60 * 1000,

  async execute(ctx) {
    userModel.ensure(ctx.sender, { pushName: ctx.pushName })
    const crime = CRIMES[Math.floor(Math.random() * CRIMES.length)]
    const success = Math.random() < 0.5

    if (success) {
      const reward = Math.floor(crime.reward[0] + Math.random() * (crime.reward[1] - crime.reward[0]))
      walletModel.reward(ctx.sender, reward, `crime: ${crime.name}`)
      const { leveledUp, newLevel } = userModel.addExp(ctx.sender, crime.exp)
      let text = `🔫 *${crime.name.toUpperCase()}*\n\n✅ Berhasil!\n🪙 +${F.formatNumber(reward)}\n⭐ +${crime.exp} EXP`
      if (leveledUp) text += `\n\n🎉 *LEVEL UP!* Kamu sekarang level *${newLevel}*!`
      await ctx.reply(text)
    } else {
      const penalty = Math.floor(crime.penalty[0] + Math.random() * (crime.penalty[1] - crime.penalty[0]))
      const wallet = walletModel.find(ctx.sender)
      const actualPenalty = Math.min(penalty, wallet?.cash ?? 0)
      if (actualPenalty > 0) walletModel.addCash(ctx.sender, -actualPenalty)
      userModel.addExp(ctx.sender, Math.floor(crime.exp * 0.3))
      await ctx.reply(`👮 *GAGAL!*\n\nKamu tertangkap saat *${crime.name}*\n💸 Denda: 🪙${F.formatNumber(actualPenalty)}`)
    }
  },
}

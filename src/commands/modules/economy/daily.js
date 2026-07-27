import { userModel, walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

const DAILY_AMOUNT = 5_000
const DAILY_EXP = 50
const DAILY_COOLDOWN = 20 * 60 * 60 * 1000

export default {
  name: 'daily',
  aliases: ['claim', 'harian'],
  category: 'economy',
  description: 'Klaim reward harian kamu',
  cooldown: DAILY_COOLDOWN,

  async execute(ctx) {
    const user = userModel.ensure(ctx.sender, { pushName: ctx.pushName })
    walletModel.reward(ctx.sender, DAILY_AMOUNT, 'daily reward')
    const { leveledUp, newLevel } = userModel.addExp(ctx.sender, DAILY_EXP)

    let text = `🎁 *Daily Reward!*\n\n🪙 +${F.formatNumber(DAILY_AMOUNT)} cash\n⭐ +${DAILY_EXP} EXP`
    if (leveledUp) text += `\n\n🎉 *LEVEL UP!* Kamu sekarang level *${newLevel}*!`
    await ctx.reply(text)
  },
}

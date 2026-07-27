import { userModel, walletModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

const JOBS = [
  { name: 'kuli bangunan', reward: [500, 1500], exp: 10 },
  { name: 'tukang kebun', reward: [300, 1000], exp: 8 },
  { name: 'programmer freelance', reward: [2000, 5000], exp: 30 },
  { name: 'ojol', reward: [400, 1200], exp: 12 },
  { name: 'guru les', reward: [600, 2000], exp: 15 },
  { name: 'chef', reward: [800, 2500], exp: 18 },
]

export default {
  name: 'work',
  aliases: ['kerja', 'bekerja'],
  category: 'economy',
  description: 'Cari uang dengan bekerja',
  cooldown: 30 * 60 * 1000,

  async execute(ctx) {
    userModel.ensure(ctx.sender, { pushName: ctx.pushName })
    const job = JOBS[Math.floor(Math.random() * JOBS.length)]
    const reward = Math.floor(job.reward[0] + Math.random() * (job.reward[1] - job.reward[0]))

    walletModel.reward(ctx.sender, reward, `work: ${job.name}`)
    const { leveledUp, newLevel } = userModel.addExp(ctx.sender, job.exp)

    let text = `💼 *Bekerja*\n\nKamu kerja sebagai *${job.name}*\n🪙 +${F.formatNumber(reward)} cash\n⭐ +${job.exp} EXP`
    if (leveledUp) text += `\n\n🎉 *LEVEL UP!* Kamu sekarang level *${newLevel}*!`
    await ctx.reply(text)
  },
}

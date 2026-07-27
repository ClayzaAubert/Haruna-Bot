import { questModel, userModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

export default {
  name: 'quest',
  aliases: ['mission', 'tugas'],
  category: 'rpg',
  description: 'Lihat progres quest kamu',
  cooldown: 5_000,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()
    userModel.ensure(ctx.sender, { pushName: ctx.pushName })

    if (sub === 'claim' && ctx.args[1]) {
      const questId = ctx.args[1]
      const progress = questModel.getProgress(ctx.sender, questId)
      if (!progress) return ctx.reply('Quest tidak ditemukan atau belum dimulai.')
      if (!progress.completed) return ctx.reply('Quest belum selesai.')
      if (progress.claimed) return ctx.reply('Quest sudah di-claim!')

      questModel.claim(ctx.sender, questId)
      const quest = questModel.findQuest(questId)
      if (quest.rewardCash > 0 || quest.rewardExp > 0) {
        const { walletModel } = await import('#storage/models/index.js')
        if (quest.rewardCash > 0) walletModel.reward(ctx.sender, quest.rewardCash, `quest: ${questId}`)
        if (quest.rewardExp > 0) userModel.addExp(ctx.sender, quest.rewardExp)
      }
      return ctx.reply(`✅ Quest *${quest?.name || questId}* selesai! Reward sudah diklaim.`)
    }

    const allProgress = questModel.getAllProgress(ctx.sender)
    if (!allProgress.length) return ctx.reply('📋 Belum ada quest.')

    let text = '📋 *Quest Progress*\n\n'
    for (const q of allProgress) {
      const badge = q.claimed ? '✅' : q.completed ? '⭐' : '📌'
      const progressBar = '█'.repeat(Math.round((q.progress / q.goal) * 10)) + '░'.repeat(10 - Math.round((q.progress / q.goal) * 10))
      text += `${badge} *${q.name}*\n  ${progressBar} ${q.progress}/${q.goal}\n  _${q.description}_\n\n`
    }

    await ctx.reply(text.trimEnd())
  },
}

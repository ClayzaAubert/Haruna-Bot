import { userModel, statsModel } from '#storage/models/index.js'

export default {
  name: 'leaderboard',
  aliases: ['lb', 'top', 'ranking'],
  category: 'rpg',
  description: 'Lihat leaderboard user',
  cooldown: 10_000,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()
    const limit = parseInt(ctx.args[1]) || 10

    if (sub === 'pvp' || sub === 'battle') {
      const top = statsModel.topWins(limit)
      if (!top.length) return ctx.reply('Belum ada data PvP.')
      let text = `🏆 *Leaderboard PvP* (Top ${limit})\n\n`
      top.forEach((u, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
        const total = u.win + u.loss
        const wr = total === 0 ? '0%' : `${Math.round((u.win / total) * 100)}%`
        text += `${medal} *${u.push_name || u.jid.split('@')[0]}* — ${u.win}W/${u.loss}L (${wr})\n`
      })
      return ctx.reply(text)
    }

    const top = userModel.leaderboard(limit)
    if (!top.length) return ctx.reply('Belum ada data user.')
    let text = `⭐ *Leaderboard Level* (Top ${limit})\n\n`
    top.forEach((u, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
      text += `${medal} *${u.push_name || u.jid.split('@')[0]}* — Level ${u.level} | 🪙${u.total_balance.toLocaleString()}\n`
    })
    await ctx.reply(text)
  },
}

import { battleService } from '#features/combat/battle.js'
import { userModel, statsModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'
import { phoneToJid } from '#helpers/identifier.js'

export default {
  name: 'battle',
  aliases: ['fight', 'lawan', 'duel'],
  category: 'rpg',
  description: 'Tantang user lain untuk battle',
  cooldown: 30_000,

  async execute(ctx) {
    const targetJid = ctx.mentions[0] ?? (ctx.args[0] ? phoneToJid(ctx.args[0]) : null)
    if (!targetJid) return ctx.reply('Usage: `!battle @tag`')
    if (targetJid === ctx.sender) return ctx.reply('❌ Tidak bisa battle sama diri sendiri.')

    userModel.ensure(ctx.sender, { pushName: ctx.pushName })
    const target = userModel.findById(targetJid)
    if (!target) return ctx.reply('❌ User tersebut belum terdaftar.')

    const aStats = statsModel.ensure(ctx.sender)
    const dStats = statsModel.ensure(targetJid)
    if (aStats.hp <= 0) return ctx.reply('❤️ HP kamu 0! Pakai `!heal` dulu.')
    if (dStats.hp <= 0) return ctx.reply('❤️ HP lawan sedang 0, tunggu dia heal dulu.')

    try {
      await ctx.react('⚔️')
      const result = battleService.fight(ctx.sender, targetJid)
      const roundLines = result.rounds.slice(0, 3).map(r => {
        const evts = r.events.map(e => {
          if (e.type === 'dodge') return `  💨 @${e.by.split('@')[0]} dodge!`
          const icon = e.type === 'crit' ? '💥' : '⚔️'
          return `  ${icon} @${e.by.split('@')[0]} hit *${F.formatNumber(e.dmg)}*${e.type === 'crit' ? ' CRIT!' : ''}`
        }).join('\n')
        return `*Ronde ${r.round}*\n${evts}\n  ❤️ ${r.aHp} vs ${r.dHp}`
      }).join('\n\n')

      const text = [
        `⚔️ *BATTLE RESULT!*`,
        '',
        roundLines,
        result.rounds.length > 3 ? `\n  _...${result.rounds.length - 3} ronde lagi..._` : '',
        '',
        `🏆 *Menang: @${result.winner.split('@')[0]}*`,
        `💀 Kalah : @${result.loser.split('@')[0]}`,
        '',
        `🎁 Reward pemenang:`,
        `  🪙 +${F.formatNumber(result.reward.cash)}`,
        `  ⭐ +${result.reward.exp} EXP`,
      ].join('\n')

      await ctx.reply(text, { mentions: [result.winner, result.loser] })
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

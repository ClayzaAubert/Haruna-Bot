import { dungeonService } from '#features/combat/dungeon.js'
import { statsModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

const HP_LEN = 8
const bar = (cur, max) => { const f = Math.round((cur / max) * HP_LEN); return '█'.repeat(f) + '░'.repeat(HP_LEN - f) }

export default {
  name: 'dungeon',
  aliases: ['dg', 'explore', 'pve'],
  category: 'rpg',
  description: 'Masuki dungeon dan lawan monster PvE',
  cooldown: 15_000,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()
    if (sub === 'monsters' || sub === 'list') {
      const monsters = dungeonService.getMonsters()
      let text = '👾 *Daftar Monster*\n\n'
      monsters.forEach(m => {
        text += `${m.emoji} *${m.name}* _(${m.rarity})_\n  ❤️${m.hp} ⚔️${m.atk} 🛡️${m.def}\n  💰 ${F.formatNumber(m.reward[0])}–${F.formatNumber(m.reward[1])} · ⭐${m.exp} EXP\n`
      })
      return ctx.reply(text.trimEnd())
    }

    const pStats = statsModel.ensure(ctx.sender)
    if (pStats.hp <= 0) return ctx.reply('❤️ HP kamu 0! Pakai `!heal` dulu.')

    await ctx.react('⚔️')
    await ctx.typing()

    try {
      const result = dungeonService.explore(ctx.sender)
      const { monster, rounds, won, rewardCash, rewardExp, drop, finalHp } = result

      const roundLog = rounds.slice(0, 4).map(r => {
        const p = r.events.find(e => e.by === 'player')
        const m = r.events.find(e => e.by === 'monster')
        return [p && `  ⚔️ Kamu hit *${F.formatNumber(p.dmg)}*`, m && `  💢 ${monster.emoji} hit *${F.formatNumber(m.dmg)}*`, `  ❤️ ${r.pHp} vs 👾 ${r.mHp}`].filter(Boolean).join('\n')
      }).join('\n\n')

      const newStats = statsModel.find(ctx.sender)
      const hpBar = bar(finalHp, newStats?.max_hp ?? 100)

      let text = `${monster.emoji} *DUNGEON — ${monster.name}*\n\n${roundLog}${rounds.length > 4 ? `\n  _...${rounds.length - 4} ronde lagi..._` : ''}\n\n${won ? '🏆 *MENANG!*' : '💀 *KALAH!*'}\n❤️ HP: [${hpBar}] ${finalHp}`
      if (won) {
        text += `\n\n🎁 *Reward:*\n  🪙 +${F.formatNumber(rewardCash)}\n  ⭐ +${rewardExp} EXP`
        if (drop) text += `\n  📦 Drop: *${drop}*`
      } else {
        text += `\n⭐ +${rewardExp} EXP (consolation)`
      }

      await ctx.reply(text)
      await ctx.react(won ? '✅' : '💀')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

import { userModel, walletModel, statsModel, inventoryModel } from '#storage/models/index.js'
import { F } from '#helpers/index.js'

const HP_BAR_LEN = 10
function hpBar(hp, maxHp) { const f = Math.round((hp / maxHp) * HP_BAR_LEN); return '█'.repeat(f) + '░'.repeat(HP_BAR_LEN - f) }

export default {
  name: 'profile',
  aliases: ['profil', 'rpg', 'char', 'character'],
  category: 'rpg',
  description: 'Lihat profil RPG kamu',
  cooldown: 5_000,

  async execute(ctx) {
    const jid = ctx.mentions[0] ?? ctx.sender
    const user = userModel.ensure(jid, { pushName: ctx.pushName })
    const wallet = walletModel.find(jid)
    const stats = statsModel.ensure(jid)
    const items = inventoryModel.getAll(jid)
    userModel.checkPremiumExpiry(jid)

    const total = (wallet?.cash ?? 0) + (wallet?.bank ?? 0)
    const expNeeded = userModel.expForLevel(user.level + 1)
    const expPct = Math.round((user.exp / expNeeded) * 100)
    const winrate = statsModel.winrate(jid)
    const weapon = items.find(i => i.item_id === stats.weapon_id)
    const armor = items.find(i => i.item_id === stats.armor_id)
    const premiumBadge = user.premium ? ' 👑' : ''

    const text = [
      `╔══ 👤 *${user.push_name || 'Unknown'}*${premiumBadge}`,
      '║',
      `║  ⭐ Level  : *${user.level}*`,
      `║  📊 EXP    : ${user.exp} / ${expNeeded} (${expPct}%)`,
      '║',
      `║  ❤️  HP    : ${hpBar(stats.hp, stats.max_hp)} ${stats.hp}/${stats.max_hp}`,
      `║  ⚔️  ATK   : *${stats.atk}*`,
      `║  🛡️  DEF   : *${stats.def}*`,
      `║  💨 SPD   : *${stats.spd}*`,
      '║',
      `║  🗡️  Weapon: *${weapon?.name ?? 'Kosong'}*`,
      `║  🥋 Armor : *${armor?.name ?? 'Kosong'}*`,
      '║',
      `║  🪙 Cash  : *${F.formatNumber(wallet?.cash ?? 0)}*`,
      `║  🏦 Bank  : *${F.formatNumber(wallet?.bank ?? 0)}*`,
      `║  📦 Total : *${F.formatNumber(total)}*`,
      '║',
      `║  🏆 W/L   : *${stats.win}W* / ${stats.loss}L (${winrate}%)`,
      '╚══════════════════',
    ].join('\n')

    await ctx.reply(text)
  },
}

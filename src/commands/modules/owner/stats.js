import { db } from '#storage/connection.js'

export default {
  name: 'stats',
  aliases: ['statistik', 'dbstats'],
  category: 'owner',
  description: 'Lihat statistik database & bot',
  cooldown: 0, ownerOnly: true,

  async execute(ctx) {
    const counts = {
      users: db.prepare('SELECT COUNT(*) as c FROM users').get()?.c ?? 0,
      groups: db.prepare('SELECT COUNT(*) as c FROM groups').get()?.c ?? 0,
      premium: db.prepare('SELECT COUNT(*) as c FROM users WHERE premium = 1').get()?.c ?? 0,
      banned: db.prepare('SELECT COUNT(*) as c FROM users WHERE banned = 1').get()?.c ?? 0,
      battles: db.prepare('SELECT COUNT(*) as c FROM stats WHERE win > 0 OR loss > 0').get()?.c ?? 0,
      transactions: db.prepare('SELECT COUNT(*) as c FROM transactions').get()?.c ?? 0,
      items: db.prepare('SELECT COUNT(*) as c FROM items').get()?.c ?? 0,
      quests: db.prepare('SELECT COUNT(*) as c FROM quests').get()?.c ?? 0,
    }

    const dbSize = db.prepare("SELECT page_count * page_size as size FROM pragma_page_count, pragma_page_size").get()?.size ?? 0

    const text = [
      `📊 *Database Statistics*`,
      '',
      `👤 Users: ${counts.users}`,
      `👥 Groups: ${counts.groups}`,
      `👑 Premium: ${counts.premium}`,
      `🚫 Banned: ${counts.banned}`,
      `⚔️ Battles: ${counts.battles}`,
      `💳 Transaksi: ${counts.transactions}`,
      `📦 Items: ${counts.items}`,
      `📋 Quests: ${counts.quests}`,
      '',
      `💾 DB Size: ${(dbSize / 1024 / 1024).toFixed(2)} MB`,
    ].join('\n')

    await ctx.reply(text)
  },
}

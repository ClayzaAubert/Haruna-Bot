import { db } from '#storage/connection.js'

export default {
  name: 'tools',
  aliases: ['tool', 'admin'],
  category: 'owner',
  description: 'Tools admin (db query, dll)',
  cooldown: 0, ownerOnly: true,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()

    if (sub === 'db' || sub === 'query') {
      const query = ctx.rawArgs.replace(/^(db|query)\s+/i, '')
      if (!query) return ctx.reply('Usage: `!tools db <query>`')
      try {
        const result = query.trim().toUpperCase().startsWith('SELECT') ? db.prepare(query).all() : db.prepare(query).run()
        await ctx.reply(`✅ Query OK:\n\`\`\`\n${JSON.stringify(result, null, 2).slice(0, 3000)}\n\`\`\``)
      } catch (err) { await ctx.reply(`❌ ${err.message}`) }
      return
    }

    await ctx.reply('Usage: `!tools db <query>`')
  },
}

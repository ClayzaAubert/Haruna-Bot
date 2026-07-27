import { broadcastService } from '#features/broadcast.js'

export default {
  name: 'broadcast',
  aliases: ['bc', 'broadcast', 'siaran'],
  category: 'owner',
  description: 'Kirim broadcast ke semua grup/user',
  cooldown: 0, ownerOnly: true,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()
    const text = ctx.rawArgs.replace(/^(group|user|all)\s+/i, '')

    if (!text) return ctx.reply('Usage: `!broadcast <group/user> <pesan>`')

    try {
      if (sub === 'group' || sub === 'grup') {
        await ctx.reply('📡 Mengirim broadcast ke semua grup...')
        const result = await broadcastService.toAllGroups(ctx.sock, { text })
        await ctx.reply(`✅ Broadcast selesai: ${result.sent} terkirim, ${result.failed} gagal.`)
      } else if (sub === 'user') {
        await ctx.reply('📡 Mengirim broadcast ke semua user...')
        const result = await broadcastService.toAllUsers(ctx.sock, { text })
        await ctx.reply(`✅ Broadcast selesai: ${result.sent} terkirim, ${result.failed} gagal.`)
      } else {
        await ctx.reply('Usage: `!broadcast <group/user> <pesan>`')
      }
    } catch (err) {
      await ctx.reply(`❌ Broadcast gagal: ${err.message}`)
    }
  },
}

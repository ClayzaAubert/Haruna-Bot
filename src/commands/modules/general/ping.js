export default {
  name: 'ping',
  aliases: ['p', 'latency'],
  category: 'general',
  description: 'Cek response time bot',
  cooldown: 5_000,

  async execute(ctx) {
    const start = Date.now()
    await ctx.reply('🏓 Pong!')
    const latency = Date.now() - start
    await ctx.reply(`🏓 *Pong!* \`${latency}ms\``)
  },
}

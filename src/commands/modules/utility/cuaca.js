import { downloaderService } from '#features/downloader.js'

export default {
  name: 'cuaca',
  aliases: ['weather', 'cekcuaca'],
  category: 'utility',
  description: 'Cek cuaca kota (API gratis)',
  cooldown: 10_000,

  async execute(ctx) {
    const city = ctx.rawArgs
    if (!city) return ctx.reply('Usage: `!cuaca <nama kota>`')

    try {
      const data = await downloaderService.fetchJson(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%h+%w`)
      await ctx.reply(`🌤️ *Cuaca ${city}*\n\n${data}`)
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

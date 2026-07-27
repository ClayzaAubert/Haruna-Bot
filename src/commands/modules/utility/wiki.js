import { downloaderService } from '#features/downloader.js'

export default {
  name: 'wiki',
  aliases: ['wikipedia', 'ensiklopedia'],
  category: 'utility',
  description: 'Cari di Wikipedia (Bahasa Indonesia)',
  cooldown: 5_000,

  async execute(ctx) {
    const query = ctx.rawArgs
    if (!query) return ctx.reply('Usage: `!wiki <kata kunci>`')

    try {
      const data = await downloaderService.fetchJson('https://id.wikipedia.org/w/api.php', {
        action: 'query', format: 'json', prop: 'extracts', exintro: true, explaintext: true,
        redirects: 1, titles: query, origin: '*', utf8: 1,
      })

      const pages = data?.query?.pages ?? {}
      const page = Object.values(pages)[0]
      if (!page || page.missing !== undefined) return ctx.reply(`❌ Artikel "${query}" tidak ditemukan.`)

      const text = `📖 *${page.title}*\n\n${(page.extract || 'Tidak ada deskripsi.').slice(0, 2500)}`
      await ctx.reply(text)
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

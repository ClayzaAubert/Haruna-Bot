import { tiktokService } from '#features/platforms/tiktok.js'
import { downloaderService } from '#features/downloader.js'

export default {
  name: 'tiktok',
  aliases: ['tt', 'tiktokdl'],
  category: 'downloader',
  description: 'Download video TikTok (tanpa watermark)',
  cooldown: 30_000,

  async execute(ctx) {
    const url = ctx.args[0]
    if (!url) return ctx.reply('Usage: `!tiktok <url>`')

    await ctx.typing()
    await ctx.react('⏳')

    try {
      const result = await tiktokService.resolve(url)

      if (result.type === 'video') {
        const buf = await tiktokService.toBuffer(result.url, result._cookie)
        await ctx.sendMedia('video', buf, `🎵 ${result.title || ''}\n👤 ${result.author || ''}`, { mimetype: 'video/mp4' })
      } else if (result.type === 'slideshow') {
        for (const imgUrl of result.images.slice(0, 10)) {
          const buf = await downloaderService.toBuffer(imgUrl)
          await ctx.sendMedia('image', buf, `📸 ${result.title}\n👤 ${result.author}`)
        }
      } else if (result.type === 'audio') {
        const buf = await tiktokService.toBuffer(result.url, result._cookie)
        await ctx.sendMedia('audio', buf, `🎵 ${result.title}\n👤 ${result.author}`, { mimetype: 'audio/mpeg', ptt: false })
      }

      await ctx.react('✅')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

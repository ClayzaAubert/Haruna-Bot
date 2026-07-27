import { instagramService } from '#features/platforms/instagram.js'
import { downloaderService } from '#features/downloader.js'

export default {
  name: 'instagram',
  aliases: ['ig', 'igdl', 'reels'],
  category: 'downloader',
  description: 'Download media Instagram (post/reel)',
  cooldown: 30_000,

  async execute(ctx) {
    const url = ctx.args[0]
    if (!url) return ctx.reply('Usage: `!instagram <url>`')

    await ctx.typing()
    await ctx.react('⏳')

    try {
      const result = await instagramService.resolve(url)

      if (result.type === 'carousel') {
        for (const item of result.items.slice(0, 10)) {
          const buf = await instagramService.toBuffer(item.url)
          await ctx.sendMedia(item.type === 'video' ? 'video' : 'image', buf, '', { mimetype: item.type === 'video' ? 'video/mp4' : 'image/jpeg' })
        }
      } else if (result.type === 'video') {
        const buf = await instagramService.toBuffer(result.url)
        await ctx.sendMedia('video', buf, '', { mimetype: 'video/mp4' })
      } else if (result.type === 'image') {
        const buf = await instagramService.toBuffer(result.url)
        await ctx.sendMedia('image', buf, '', { mimetype: 'image/jpeg' })
      }

      await ctx.react('✅')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

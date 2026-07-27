import { facebookService } from '#features/platforms/facebook.js'

export default {
  name: 'facebook',
  aliases: ['fb', 'fbdl', 'facebookdl'],
  category: 'downloader',
  description: 'Download video Facebook/reel',
  cooldown: 30_000,

  async execute(ctx) {
    const url = ctx.args[0]
    if (!url) return ctx.reply('Usage: `!facebook <url>`')

    await ctx.typing()
    await ctx.react('⏳')

    try {
      const result = await facebookService.resolve(url)
      const buf = await facebookService.toBuffer(result.url)
      const caption = result.title ? `${result.title}\n${result.hasHd ? '📺 HD tersedia' : ''}` : ''
      await ctx.sendMedia('video', buf, caption, { mimetype: 'video/mp4' })
      await ctx.react('✅')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

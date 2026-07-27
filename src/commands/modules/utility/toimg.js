import { imageToWebp } from '#features/media/sticker.js'

export default {
  name: 'toimg',
  aliases: ['toimage', 'jpg', 'png'],
  category: 'utility',
  description: 'Convert sticker ke gambar',
  cooldown: 10_000,

  async execute(ctx) {
    const quoted = ctx.quoted
    if (!quoted || !quoted.isMedia || !quoted.mimetype?.includes('webp')) return ctx.reply('Reply sticker dengan `!toimg`')

    await ctx.react('⏳')

    try {
      const buffer = await ctx.downloadMedia()
      if (!buffer) return ctx.reply('Gagal download sticker.')

      const jpgBuffer = await imageToWebp(buffer)
      await ctx.sendMedia('image', jpgBuffer, '', { mimetype: 'image/png' })
      await ctx.react('✅')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

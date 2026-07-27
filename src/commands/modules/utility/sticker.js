import { toStickerBuffer } from '#features/media/sticker.js'

export default {
  name: 'sticker',
  aliases: ['s', 'stiker', 'sgif'],
  category: 'utility',
  description: 'Buat sticker dari gambar/video',
  cooldown: 10_000,

  async execute(ctx) {
    const media = ctx.quoted?.media || ctx.msg?.media
    if (!media) return ctx.reply('Reply gambar/video dengan `!sticker`')

    await ctx.react('⏳')
    await ctx.typing()

    try {
      const buffer = await ctx.downloadMedia()
      if (!buffer) return ctx.reply('Gagal download media.')

      const meta = ctx.rawArgs?.trim() ? { packName: ctx.rawArgs.trim(), packPublish: ctx.pushName || 'HarunaBot', emojis: ['🤖'] } : {}
      const sticker = await toStickerBuffer(buffer, meta)

      await ctx.send({
        sticker, mimetype: 'image/webp', ptt: false,
        contextInfo: { forwardingScore: 0, isForwarded: false },
      })
      await ctx.react('✅')
    } catch (err) {
      await ctx.react('❌')
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

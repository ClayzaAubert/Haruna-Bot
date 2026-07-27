import { downloaderService } from '#features/downloader.js'

export default {
  name: 'tts',
  aliases: ['speech', 'suara'],
  category: 'utility',
  description: 'Text-to-speech (Google TTS)',
  cooldown: 5_000,

  async execute(ctx) {
    const lang = ctx.args[0]?.length === 2 ? ctx.args[0] : 'id'
    const text = ctx.args[0]?.length === 2 ? ctx.args.slice(1).join(' ') : ctx.rawArgs
    if (!text) return ctx.reply('Usage: `!tts [lang] <teks>`')

    try {
      const buffer = await downloaderService.toBuffer(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`)
      await ctx.sendMedia('audio', buffer, '', { mimetype: 'audio/mpeg', ptt: true })
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

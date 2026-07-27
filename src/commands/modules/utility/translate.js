import { downloaderService } from '#features/downloader.js'

export default {
  name: 'translate',
  aliases: ['tl', 'terjemah'],
  category: 'utility',
  description: 'Terjemahkan teks ke bahasa lain (default: id)',
  cooldown: 5_000,

  async execute(ctx) {
    const args = ctx.rawArgs.split(/\s+/)
    let targetLang = 'id'
    let text = ctx.rawArgs

    if (args[0] && args[0].length === 2 && !args[0].startsWith('!')) {
      targetLang = args[0]
      text = args.slice(1).join(' ')
    }

    if (!text) {
      const quotedText = ctx.quoted?.text
      if (!quotedText) return ctx.reply('Usage: `!translate [lang] <teks>`')
      text = quotedText
    }

    try {
      const data = await downloaderService.fetchJson('https://translate.googleapis.com/translate_a/single', {
        client: 'gtx', sl: 'auto', tl: targetLang, dt: 't', q: text,
      })
      const result = data?.[0]?.map(p => p?.[0]).filter(Boolean).join('')
      if (!result) return ctx.reply('❌ Gagal menerjemahkan.')
      await ctx.reply(`🌐 *Translate → ${targetLang.toUpperCase()}*\n\n${result}`)
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

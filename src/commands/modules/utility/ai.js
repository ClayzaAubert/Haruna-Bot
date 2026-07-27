import { aiService } from '#features/ai.js'

export default {
  name: 'ai',
  aliases: ['ask', 'chat', 'gpt'],
  category: 'utility',
  description: 'Tanya AI (OpenAI/Anthropic/Groq)',
  cooldown: 15_000,

  async execute(ctx) {
    if (!aiService.isAvailable()) return ctx.reply('AI tidak tersedia — owner belum konfigurasi API key.')

    const prompt = ctx.rawArgs
    if (!prompt) return ctx.reply('Usage: `!ai <pertanyaan>`')

    await ctx.typing()
    await ctx.react('🤖')

    try {
      const response = await aiService.chat(prompt)
      await ctx.reply(`🤖 *AI Response*\n\n${response}`)
    } catch (err) {
      await ctx.reply(`❌ ${err.message}`)
    }
  },
}

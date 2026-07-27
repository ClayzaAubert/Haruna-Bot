import { inspect } from 'util'

export default {
  name: 'eval',
  aliases: ['ev', '>'],
  category: 'owner',
  description: 'Evaluasi kode JavaScript',
  cooldown: 0, ownerOnly: true,

  async execute(ctx) {
    const code = ctx.rawArgs
    if (!code) return ctx.reply('Usage: `!eval <code>`')
    let output, isError = false
    try {
      let result = eval(code)
      if (result instanceof Promise) result = await result
      output = inspect(result, { depth: 3, colors: false, maxArrayLength: 20 })
    } catch (err) { output = err.message; isError = true }
    await ctx.reply(`${isError ? '❌' : '✅'} *${isError ? 'Error' : 'Output'}:*\n\`\`\`\n${String(output).slice(0, 3500)}\n\`\`\``)
  },
}

import { groupModel } from '#storage/models/index.js'

export default {
  name: 'groupset',
  aliases: ['gset', 'grpset'],
  category: 'group',
  description: 'Atur pengaturan grup (antilink, mute, dll)',
  cooldown: 5_000, groupOnly: true, adminOnly: true,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()
    const value = ctx.args[1]?.toLowerCase()

    if (!sub || !['antilink', 'antiflood', 'mute', 'nsfw'].includes(sub) || !['on', 'off'].includes(value)) {
      const g = groupModel.find(ctx.jid)
      return ctx.reply(`*Pengaturan Grup*\n\n📎 Antilink: ${g?.antilink ? '✅' : '❌'}\n🌊 Antiflood: ${g?.antiflood ? '✅' : '❌'}\n🔇 Mute: ${g?.mute ? '✅' : '❌'}\n🔞 NSFW: ${g?.nsfw ? '✅' : '❌'}\n\nUsage: \`!groupset <antilink/antiflood/mute/nsfw> <on/off>\``)
    }

    const updates = {}
    updates[sub] = value === 'on' ? 1 : 0
    groupModel.update(ctx.jid, updates)
    await ctx.reply(`✅ *${sub}* ${value === 'on' ? 'diaktifkan' : 'dinonaktifkan'}.`)
  },
}

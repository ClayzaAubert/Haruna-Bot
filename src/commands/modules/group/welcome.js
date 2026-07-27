import { groupModel } from '#storage/models/index.js'

export default {
  name: 'welcome',
  aliases: ['setwelcome', 'goodbye', 'setbye'],
  category: 'group',
  description: 'Atur pesan welcome/goodbye grup',
  cooldown: 5_000, groupOnly: true, adminOnly: true,

  async execute(ctx) {
    const sub = ctx.args[0]?.toLowerCase()

    if (sub === 'on' || sub === 'enable' || sub === 'off' || sub === 'disable') {
      const enabled = sub === 'on' || sub === 'enable'
      groupModel.update(ctx.jid, { welcome: enabled ? 1 : 0 })
      return ctx.reply(`✅ Welcome message ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`)
    }

    if (sub === 'set') {
      const msg = ctx.rawArgs.replace(/^set\s+/i, '')
      if (!msg) return ctx.reply('Usage: `!welcome set <pesan>`')
      groupModel.update(ctx.jid, { welcome_msg: msg })
      return ctx.reply('✅ Welcome message diupdate.')
    }

    const settings = groupModel.find(ctx.jid)
    if (!settings) return ctx.reply('Grup belum terdaftar.')

    const status = settings.welcome ? '✅ Aktif' : '❌ Nonaktif'
    await ctx.reply(`👋 *Welcome Settings*\n\nStatus: ${status}\nPesan: ${settings.welcome_msg || '(default)'}`)
  },
}

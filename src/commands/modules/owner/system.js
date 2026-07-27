import { F } from '#helpers/index.js'

const startTime = Date.now()

export default {
  name: 'system',
  aliases: ['sys', 'host'],
  category: 'owner',
  description: 'Lihat info sistem bot',
  cooldown: 0, ownerOnly: true,

  async execute(ctx) {
    const uptime = F.formatDuration(Date.now() - startTime)
    const mem = process.memoryUsage()
    const cpu = process.cpuUsage()
    const nodeVer = process.version
    const platform = process.platform
    const arch = process.arch
    const pid = process.pid

    const text = [
      `💻 *System Info*`,
      '',
      `⏱ Uptime: ${uptime}`,
      `🧠 Heap: ${F.formatBytes(mem.heapUsed)} / ${F.formatBytes(mem.heapTotal)}`,
      `💾 RSS: ${F.formatBytes(mem.rss)}`,
      `⚙️ CPU: ${(cpu.user / 1000000).toFixed(2)}s user / ${(cpu.system / 1000000).toFixed(2)}s system`,
      `📦 Node: ${nodeVer}`,
      `🖥️ Platform: ${platform} ${arch}`,
      `🆔 PID: ${pid}`,
    ].join('\n')

    await ctx.reply(text)
  },
}

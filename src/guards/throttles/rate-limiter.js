import NodeCache from 'node-cache'
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW } from '#environment/limits.js'

const cache = new NodeCache({ stdTTL: RATE_LIMIT_WINDOW, checkperiod: 30, useClones: false, maxKeys: 5000 })

export async function checkRateLimit(ctx, _command) {
  if (ctx.isOwner()) return true

  const key = ctx.sender
  const count = (cache.get(key) ?? 0) + 1
  cache.set(key, count)

  if (count > RATE_LIMIT_MAX) {
    if (count === RATE_LIMIT_MAX + 1) {
      await ctx.reply('Terlalu banyak command! Tunggu sebentar.').catch(() => {})
    }
    return false
  }

  return true
}

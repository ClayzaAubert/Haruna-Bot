import { checkBanned } from './throttles/ban-check.js'
import { checkRateLimit } from './throttles/rate-limiter.js'
import { checkCooldown } from './throttles/cooldown.js'
import { checkOwner } from './restrictions/owner-only.js'
import { checkPremium } from './restrictions/premium-only.js'
import { checkGroup } from './restrictions/group-only.js'
import { checkPrivate } from './restrictions/private-only.js'
import { checkAdmin } from './restrictions/admin-only.js'

const PIPELINE = [
  checkBanned, checkRateLimit, checkCooldown,
  checkOwner, checkPremium, checkGroup, checkPrivate, checkAdmin,
]

export async function runPipeline(ctx, command) {
  for (const guard of PIPELINE) {
    if (await guard(ctx, command) === false) return false
  }
  return true
}

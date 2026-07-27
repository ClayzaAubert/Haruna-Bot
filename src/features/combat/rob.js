import { db } from '#storage/connection.js'
import { userModel, walletModel, statsModel, questModel } from '#storage/models/index.js'

const MIN_CHANCE = 0.3
const MAX_CHANCE = 0.7
const ROB_MIN_PCT = 0.1
const ROB_MAX_PCT = 0.3
const PENALTY_PCT = 0.2
const MIN_CASH = 500

class RobService {
  attempt(robberJid, targetJid) {
    userModel.ensure(robberJid); userModel.ensure(targetJid)
    const robberStats = statsModel.ensure(robberJid)
    const targetStats = statsModel.ensure(targetJid)
    const targetWallet = walletModel.find(targetJid)

    if (!targetWallet || targetWallet.cash < MIN_CASH)
      throw new Error(`Target tidak punya cukup cash untuk dirampok (min: 🪙${MIN_CASH}).`)

    const atkAdv = robberStats.atk - targetStats.def
    const chance = Math.min(MAX_CHANCE, Math.max(MIN_CHANCE, 0.5 + atkAdv / 100))
    const success = Math.random() < chance
    let stolen = 0, penalty = 0

    db.transaction(() => {
      if (success) {
        const pct = ROB_MIN_PCT + Math.random() * (ROB_MAX_PCT - ROB_MIN_PCT)
        stolen = Math.max(1, Math.floor(targetWallet.cash * pct))
        walletModel.addCash(targetJid, -stolen)
        walletModel.addCash(robberJid, stolen)
        questModel.addProgress(robberJid, 'daily_rob', 1)
      } else {
        const robberWallet = walletModel.find(robberJid)
        penalty = Math.floor((robberWallet?.cash ?? 0) * PENALTY_PCT)
        if (penalty > 0) walletModel.addCash(robberJid, -penalty)
      }
    })()

    return { success, stolen, penalty, chance: Math.round(chance * 100) }
  }
}

export const robService = new RobService()

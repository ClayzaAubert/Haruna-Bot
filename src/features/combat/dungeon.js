import { db } from '#storage/connection.js'
import { userModel, walletModel, statsModel, inventoryModel, questModel } from '#storage/models/index.js'

const MONSTERS = [
  { id: 'slime', name: 'Slime', emoji: '🟢', atk: 5, def: 2, hp: 30, reward: [200, 500], exp: 15, rarity: 'common' },
  { id: 'goblin', name: 'Goblin', emoji: '👺', atk: 10, def: 5, hp: 60, reward: [400, 900], exp: 25, rarity: 'common' },
  { id: 'wolf', name: 'Dire Wolf', emoji: '🐺', atk: 18, def: 8, hp: 100, reward: [700, 1500], exp: 40, rarity: 'uncommon' },
  { id: 'orc', name: 'Orc Warrior', emoji: '👹', atk: 25, def: 15, hp: 150, reward: [1200, 2500], exp: 60, rarity: 'uncommon' },
  { id: 'troll', name: 'Cave Troll', emoji: '🪨', atk: 35, def: 20, hp: 250, reward: [2000, 4000], exp: 90, rarity: 'rare' },
  { id: 'dragon', name: 'Drake', emoji: '🐉', atk: 55, def: 30, hp: 400, reward: [4000, 8000], exp: 150, rarity: 'epic' },
]

class DungeonService {
  explore(playerJid) {
    userModel.ensure(playerJid)
    const pStats = statsModel.ensure(playerJid)
    const pUser = userModel.findById(playerJid)

    if (pStats.hp <= 0) throw new Error('HP kamu 0! Pakai `!heal` dulu sebelum masuk dungeon.')

    const pool = this._monsterPool(pUser.level)
    const monster = pool[Math.floor(Math.random() * pool.length)]
    const rounds = this._simulate(pStats, monster)
    const won = rounds.at(-1).pHp > 0

    const rewardCash = won ? Math.floor(monster.reward[0] + Math.random() * (monster.reward[1] - monster.reward[0])) : 0
    const rewardExp = won ? monster.exp : Math.floor(monster.exp * 0.2)
    const drop = won ? this._rollDrop(monster) : null

    db.transaction(() => {
      statsModel.setHp(playerJid, Math.max(0, rounds.at(-1).pHp))
      if (won) {
        statsModel.addHp(playerJid, Math.floor(pStats.max_hp * 0.1))
        if (rewardCash > 0) walletModel.reward(playerJid, rewardCash, `dungeon: ${monster.id}`)
        if (drop) inventoryModel.add(playerJid, drop, 1)
        statsModel.recordWin(playerJid)
        questModel.addProgress(playerJid, 'total_battles', 1)
      } else {
        statsModel.recordLoss(playerJid)
        questModel.addProgress(playerJid, 'total_battles', 1)
      }
      userModel.addExp(playerJid, rewardExp)
    })()

    return { monster, rounds, won, rewardCash, rewardExp, drop, finalHp: Math.max(0, rounds.at(-1).pHp) }
  }

  _monsterPool(level) {
    if (level >= 20) return MONSTERS
    if (level >= 12) return MONSTERS.slice(0, 5)
    if (level >= 6) return MONSTERS.slice(0, 4)
    if (level >= 3) return MONSTERS.slice(0, 3)
    return MONSTERS.slice(0, 2)
  }

  _simulate(pStats, monster) {
    const rounds = []
    let pHp = pStats.hp, mHp = monster.hp

    for (let i = 0; i < 15 && pHp > 0 && mHp > 0; i++) {
      const r = { round: i + 1, pHp, mHp, events: [] }

      const pDmg = Math.max(1, pStats.atk - Math.floor(monster.def / 2))
      const pVar = Math.floor(pDmg * 0.2)
      mHp = Math.max(0, mHp - Math.max(1, pDmg + Math.floor(Math.random() * pVar * 2) - pVar))
      r.events.push({ by: 'player', dmg: Math.max(1, pDmg + Math.floor(Math.random() * pVar * 2) - pVar) })

      if (mHp <= 0) { r.pHp = pHp; r.mHp = 0; rounds.push(r); break }

      const mDmg = Math.max(1, monster.atk - Math.floor(pStats.def / 2))
      const mVar = Math.floor(mDmg * 0.2)
      pHp = Math.max(0, pHp - Math.max(1, mDmg + Math.floor(Math.random() * mVar * 2) - mVar))
      r.events.push({ by: 'monster', dmg: Math.max(1, mDmg + Math.floor(Math.random() * mVar * 2) - mVar) })

      r.pHp = pHp; r.mHp = mHp; rounds.push(r)
    }
    return rounds
  }

  _rollDrop(monster) {
    const rates = { common: 0.40, uncommon: 0.25, rare: 0.12, epic: 0.05 }
    if (Math.random() > (rates[monster.rarity] ?? 0.20)) return null
    const drops = { common: ['potion_hp_sm'], uncommon: ['potion_hp_sm', 'potion_hp_md'], rare: ['potion_hp_md', 'potion_hp_lg'], epic: ['potion_hp_lg', 'lootbox_std'] }
    const pool = drops[monster.rarity] ?? drops.common
    return pool[Math.floor(Math.random() * pool.length)]
  }

  getMonsters() { return MONSTERS }
}

export const dungeonService = new DungeonService()

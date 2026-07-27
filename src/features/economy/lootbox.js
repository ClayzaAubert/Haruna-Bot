import { db } from '#storage/connection.js'
import { walletModel, inventoryModel, itemModel } from '#storage/models/index.js'

const RARITY_WEIGHTS = [
  { rarity: 'legendary', weight: 1 },
  { rarity: 'epic', weight: 4 },
  { rarity: 'rare', weight: 10 },
  { rarity: 'uncommon', weight: 25 },
  { rarity: 'common', weight: 60 },
]
const TOTAL_WEIGHT = RARITY_WEIGHTS.reduce((s, r) => s + r.weight, 0)

class LootboxService {
  open(jid, lootboxId = 'lootbox_std') {
    if (!inventoryModel.hasItem(jid, lootboxId))
      throw new Error('Kamu tidak punya *Lootbox*. Beli dulu di toko!')

    const rarity = this._rollRarity()
    const pool = itemModel.findAll().filter(i => i.rarity === rarity && i.category !== 'special')
    if (!pool.length) return this.open(jid, lootboxId)

    const item = pool[Math.floor(Math.random() * pool.length)]
    const hadBefore = inventoryModel.hasItem(jid, item.id)

    db.transaction(() => {
      inventoryModel.remove(jid, lootboxId, 1)
      inventoryModel.add(jid, item.id, 1)
    })()

    return { item, rarity, isNew: !hadBefore }
  }

  _rollRarity() {
    let roll = Math.random() * TOTAL_WEIGHT
    for (const { rarity, weight } of RARITY_WEIGHTS) {
      roll -= weight
      if (roll <= 0) return rarity
    }
    return 'common'
  }
}

export const lootboxService = new LootboxService()

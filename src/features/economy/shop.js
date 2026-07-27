import { db } from '#storage/connection.js'
import { walletModel, inventoryModel, itemModel, statsModel } from '#storage/models/index.js'

const SELL_RATE = 0.6

class ShopService {
  buy(jid, itemId, qty = 1) {
    const item = itemModel.findById(itemId)
    if (!item) throw new Error(`Item \`${itemId}\` tidak ditemukan.`)
    if (item.price <= 0) throw new Error('Item ini tidak dijual di toko.')

    const total = item.price * qty
    const wallet = walletModel.find(jid)
    if (!wallet || wallet.cash < total) throw new Error(`Saldo cash tidak cukup. Butuh 🪙${total.toLocaleString()}.`)

    db.transaction(() => { walletModel.addCash(jid, -total); inventoryModel.add(jid, itemId, qty) })()
    return { item, qty, total }
  }

  sell(jid, itemId, qty = 1) {
    const item = itemModel.findById(itemId)
    if (!item) throw new Error(`Item \`${itemId}\` tidak ditemukan.`)
    if (!item.sellable) throw new Error('Item ini tidak bisa dijual.')

    const owned = inventoryModel.getItem(jid, itemId)
    if (!owned || owned.quantity < qty) throw new Error(`Kamu tidak punya cukup *${item.name}* (punya: ${owned?.quantity ?? 0}).`)

    const earned = Math.floor(item.price * SELL_RATE) * qty
    db.transaction(() => { inventoryModel.remove(jid, itemId, qty); walletModel.addCash(jid, earned) })()
    return { item, qty, earned }
  }

  equip(jid, itemId, userLevel = 1) {
    const item = itemModel.findById(itemId)
    if (!item) throw new Error('Item tidak ditemukan.')
    if (!['weapon', 'armor'].includes(item.category)) throw new Error('Hanya weapon atau armor yang bisa diequip.')
    if (!inventoryModel.hasItem(jid, itemId)) throw new Error(`Kamu tidak punya *${item.name}*.`)

    const stats = statsModel.ensure(jid)
    const itemData = JSON.parse(item.data ?? '{}')
    const weaponId = item.category === 'weapon' ? itemId : stats.weapon_id
    const armorId = item.category === 'armor' ? itemId : stats.armor_id
    const weaponData = weaponId ? JSON.parse(itemModel.findById(weaponId)?.data ?? '{}') : {}
    const armorData = armorId ? JSON.parse(itemModel.findById(armorId)?.data ?? '{}') : {}
    const atk = 10 + (weaponData.atk ?? 0)
    const def = 5 + (armorData.def ?? 0)
    const maxHp = 100 + userLevel * 10 + (armorData.hp ?? 0)

    statsModel.updateEquipment(jid, { weaponId, armorId, atk, def, maxHp })
    return { item, atk, def, maxHp }
  }

  unequip(jid, slot, userLevel = 1) {
    if (!['weapon', 'armor'].includes(slot)) throw new Error("Slot harus 'weapon' atau 'armor'.")
    const stats = statsModel.ensure(jid)
    const weaponId = slot === 'weapon' ? null : stats.weapon_id
    const armorId = slot === 'armor' ? null : stats.armor_id
    const weaponData = weaponId ? JSON.parse(itemModel.findById(weaponId)?.data ?? '{}') : {}
    const armorData = armorId ? JSON.parse(itemModel.findById(armorId)?.data ?? '{}') : {}
    const atk = 10 + (weaponData.atk ?? 0)
    const def = 5 + (armorData.def ?? 0)
    const maxHp = 100 + userLevel * 10 + (armorData.hp ?? 0)
    statsModel.updateEquipment(jid, { weaponId, armorId, atk, def, maxHp })
    return { slot, atk, def, maxHp }
  }

  getShopItems() {
    return itemModel.shopItems().reduce((acc, item) => {
      const cat = item.category; if (!acc[cat]) acc[cat] = []; acc[cat].push(item); return acc
    }, {})
  }
}

export const shopService = new ShopService()

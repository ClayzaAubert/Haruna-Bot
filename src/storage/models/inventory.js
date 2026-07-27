import { db } from '#storage/connection.js'
import { lazyPrepare } from '#storage/lazy.js'
import { logger } from '#helpers/logger.js'

class InventoryModel {
  _findAll = lazyPrepare(`
    SELECT i.*, it.name, it.description, it.category, it.rarity, it.sellable
    FROM inventories i JOIN items it ON it.id = i.item_id
    WHERE i.jid = ? ORDER BY it.category, it.name
  `)
  _findOne = lazyPrepare(`
    SELECT i.*, it.name, it.description, it.category, it.rarity, it.sellable, it.price
    FROM inventories i JOIN items it ON it.id = i.item_id
    WHERE i.jid = @jid AND i.item_id = @itemId
  `)
  _upsertAdd = lazyPrepare(`
    INSERT INTO inventories (jid, item_id, quantity) VALUES (@jid, @itemId, @qty)
    ON CONFLICT(jid, item_id) DO UPDATE SET quantity = quantity + @qty
  `)
  _removeQty = lazyPrepare('UPDATE inventories SET quantity = quantity - @qty WHERE jid = @jid AND item_id = @itemId')
  _deleteEmpty = lazyPrepare('DELETE FROM inventories WHERE jid = ? AND quantity <= 0')
  _countSlots = lazyPrepare('SELECT COUNT(*) as count FROM inventories WHERE jid = ?')
  _itemExists = lazyPrepare('SELECT id FROM items WHERE id = ?')

  getAll(jid) { return this._findAll().all(jid) }
  getItem(jid, itemId) { return this._findOne().get({ jid, itemId }) ?? null }
  hasItem(jid, itemId, qty = 1) {
    const row = this._findOne().get({ jid, itemId })
    return row ? row.quantity >= qty : false
  }

  add(jid, itemId, qty = 1) {
    const exists = this._itemExists().get(itemId)
    if (!exists) {
      logger.warn({ itemId, jid }, 'Item not in master table — run seed')
      return false
    }
    this._upsertAdd().run({ jid, itemId, qty })
    return true
  }

  remove(jid, itemId, qty = 1) {
    const row = this._findOne().get({ jid, itemId })
    if (!row || row.quantity < qty) throw new Error(`Item tidak cukup: ${itemId}`)
    this._removeQty().run({ jid, itemId, qty })
    this._deleteEmpty().run(jid)
  }

  countSlots(jid) { return this._countSlots().get(jid)?.count ?? 0 }
}

export const inventoryModel = new InventoryModel()

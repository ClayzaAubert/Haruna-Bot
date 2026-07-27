import { db } from '#storage/connection.js'
import { lazyPrepare } from '#storage/lazy.js'

class ItemModel {
  _findById = lazyPrepare('SELECT * FROM items WHERE id = ?')
  _findAll = lazyPrepare('SELECT * FROM items ORDER BY category, name')
  _findByCat = lazyPrepare('SELECT * FROM items WHERE category = ? ORDER BY price')
  _shopItems = lazyPrepare('SELECT * FROM items WHERE price > 0 ORDER BY category, price')
  _upsert = lazyPrepare(`
    INSERT INTO items (id, name, description, category, price, sellable, stackable, rarity, data)
      VALUES (@id, @name, @description, @category, @price, @sellable, @stackable, @rarity, @data)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, description=excluded.description, category=excluded.category,
      price=excluded.price, sellable=excluded.sellable, stackable=excluded.stackable,
      rarity=excluded.rarity, data=excluded.data
  `)

  findById(id) { return this._findById().get(id) ?? null }
  findAll() { return this._findAll().all() }
  findByCategory(cat) { return this._findByCat().all(cat) }
  shopItems() { return this._shopItems().all() }

  upsert(item) {
    this._upsert().run({
      id: item.id, name: item.name, description: item.description ?? '',
      category: item.category ?? 'misc', price: item.price ?? 0,
      sellable: item.sellable ? 1 : 0, stackable: item.stackable ? 1 : 0,
      rarity: item.rarity ?? 'common', data: JSON.stringify(item.data ?? {}),
    })
  }

  bulkUpsert(items) { db.transaction(() => items.forEach(i => this.upsert(i)))() }
}

export const itemModel = new ItemModel()

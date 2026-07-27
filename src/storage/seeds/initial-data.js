import { initializeDatabase } from '#storage/initializer.js'
import { logger } from '#helpers/logger.js'

await initializeDatabase()

const { itemModel } = await import('#storage/models/item.js')
const { questModel } = await import('#storage/models/quest.js')

const ITEMS = [
  { id: 'potion_hp_sm', name: 'Health Potion (S)', description: 'Pulihkan 50 HP', category: 'consumable', price: 500, rarity: 'common', sellable: true, stackable: true, data: { heal: 50 } },
  { id: 'potion_hp_md', name: 'Health Potion (M)', description: 'Pulihkan 150 HP', category: 'consumable', price: 1200, rarity: 'uncommon', sellable: true, stackable: true, data: { heal: 150 } },
  { id: 'potion_hp_lg', name: 'Health Potion (L)', description: 'Pulihkan 500 HP', category: 'consumable', price: 3500, rarity: 'rare', sellable: true, stackable: true, data: { heal: 500 } },
  { id: 'potion_exp', name: 'EXP Booster', description: '2x EXP selama 1 jam', category: 'consumable', price: 5000, rarity: 'rare', sellable: true, stackable: true, data: {} },
  { id: 'sword_wood', name: 'Wooden Sword', description: 'ATK +5', category: 'weapon', price: 800, rarity: 'common', sellable: true, stackable: false, data: { atk: 5 } },
  { id: 'sword_iron', name: 'Iron Sword', description: 'ATK +15', category: 'weapon', price: 3000, rarity: 'uncommon', sellable: true, stackable: false, data: { atk: 15 } },
  { id: 'sword_steel', name: 'Steel Sword', description: 'ATK +30', category: 'weapon', price: 8000, rarity: 'rare', sellable: true, stackable: false, data: { atk: 30 } },
  { id: 'sword_mythril', name: 'Mythril Sword', description: 'ATK +70', category: 'weapon', price: 25000, rarity: 'epic', sellable: true, stackable: false, data: { atk: 70 } },
  { id: 'armor_leather', name: 'Leather Armor', description: 'DEF +5', category: 'armor', price: 1000, rarity: 'common', sellable: true, stackable: false, data: { def: 5 } },
  { id: 'armor_iron', name: 'Iron Armor', description: 'DEF +15', category: 'armor', price: 4000, rarity: 'uncommon', sellable: true, stackable: false, data: { def: 15 } },
  { id: 'armor_steel', name: 'Steel Armor', description: 'DEF +35 · HP +50', category: 'armor', price: 10000, rarity: 'rare', sellable: true, stackable: false, data: { def: 35, hp: 50 } },
  { id: 'bank_upgrade', name: 'Bank Upgrade', description: 'Limit bank +50000', category: 'special', price: 15000, rarity: 'uncommon', sellable: false, stackable: false, data: {} },
  { id: 'premium_7d', name: 'Premium 7 Hari', description: 'Akses fitur premium', category: 'special', price: 50000, rarity: 'epic', sellable: false, stackable: false, data: {} },
  { id: 'lootbox_std', name: 'Lootbox Standar', description: 'Item random gacha', category: 'special', price: 2000, rarity: 'common', sellable: false, stackable: true, data: {} },
]

const QUESTS = [
  { id: 'daily_win', name: 'Pemenang Harian', description: 'Menang 3 battle hari ini', type: 'daily', goal: 3, rewardCash: 3000, rewardExp: 50 },
  { id: 'daily_rob', name: 'Perampok Harian', description: 'Rampok 1 user hari ini', type: 'daily', goal: 1, rewardCash: 1500, rewardExp: 20 },
  { id: 'daily_shop', name: 'Belanja Harian', description: 'Beli 1 item di toko', type: 'daily', goal: 1, rewardCash: 500, rewardExp: 10 },
  { id: 'weekly_win', name: 'Warrior Minggu Ini', description: 'Menang 20 battle minggu ini', type: 'weekly', goal: 20, rewardCash: 25000, rewardExp: 300, rewardItem: 'lootbox_std' },
  { id: 'total_battles', name: 'Battle Maniac', description: 'Ikut 50 battle total', type: 'story', goal: 50, rewardCash: 10000, rewardExp: 200, rewardItem: 'sword_steel' },
]

itemModel.bulkUpsert(ITEMS)
logger.info(`Seeded ${ITEMS.length} items`)

questModel.bulkUpsert(QUESTS)
logger.info(`Seeded ${QUESTS.length} quests`)
logger.info('Seed complete — run: npm run dev')

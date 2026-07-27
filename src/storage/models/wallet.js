import { db } from '#storage/connection.js'
import { lazyPrepare } from '#storage/lazy.js'

class WalletModel {
  _find = lazyPrepare('SELECT * FROM wallets WHERE jid = ?')
  _addCash = lazyPrepare('UPDATE wallets SET cash = cash + @amount, updated_at = unixepoch() WHERE jid = @jid')
  _addBank = lazyPrepare('UPDATE wallets SET bank = bank + @amount, updated_at = unixepoch() WHERE jid = @jid')
  _insertTx = lazyPrepare('INSERT INTO transactions (from_jid, to_jid, amount, type, note) VALUES (@fromJid, @toJid, @amount, @type, @note)')

  find(jid) { return this._find().get(jid) ?? null }

  addCash(jid, amount) {
    const w = this._find().get(jid)
    if (amount < 0 && w && w.cash < Math.abs(amount)) throw new Error('Saldo cash tidak cukup')
    this._addCash().run({ jid, amount })
  }

  addBank(jid, amount) {
    const w = this._find().get(jid)
    if (amount < 0 && w && w.bank < Math.abs(amount)) throw new Error('Saldo bank tidak cukup')
    this._addBank().run({ jid, amount })
  }

  reward(jid, amount, note = 'reward') {
    this._addCash().run({ jid, amount })
    this._insertTx().run({ fromJid: 'system', toJid: jid, amount, type: 'reward', note })
  }

  transfer(fromJid, toJid, amount, note = '') {
    db.transaction(() => {
      const sender = this._find().get(fromJid)
      if (!sender || sender.cash < amount) throw new Error('Saldo cash tidak cukup')
      this._addCash().run({ jid: fromJid, amount: -amount })
      this._addCash().run({ jid: toJid, amount })
      this._insertTx().run({ fromJid, toJid, amount, type: 'transfer', note })
    })()
  }

  deposit(jid, amount) {
    db.transaction(() => {
      const w = this._find().get(jid)
      if (!w || w.cash < amount) throw new Error('Saldo cash tidak cukup')
      if (w.bank + amount > w.bank_limit) throw new Error(`Limit bank terlampaui (max: ${w.bank_limit})`)
      this._addCash().run({ jid, amount: -amount })
      this._addBank().run({ jid, amount })
    })()
  }

  withdraw(jid, amount) {
    db.transaction(() => {
      const w = this._find().get(jid)
      if (!w || w.bank < amount) throw new Error('Saldo bank tidak cukup')
      this._addBank().run({ jid, amount: -amount })
      this._addCash().run({ jid, amount })
    })()
  }

  history(jid, limit = 10) {
    return db.prepare(`
      SELECT * FROM transactions
      WHERE from_jid = @jid OR to_jid = @jid
      ORDER BY created_at DESC LIMIT @limit
    `).all({ jid, limit })
  }
}

export const walletModel = new WalletModel()

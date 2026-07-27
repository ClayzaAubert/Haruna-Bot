import { db } from './connection.js'
import { logger } from '#helpers/logger.js'

export function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      jid         TEXT    PRIMARY KEY,
      pn          TEXT    UNIQUE,
      push_name   TEXT    NOT NULL DEFAULT '',
      level       INTEGER NOT NULL DEFAULT 1,
      exp         INTEGER NOT NULL DEFAULT 0,
      premium     INTEGER NOT NULL DEFAULT 0,
      premium_exp INTEGER NOT NULL DEFAULT 0,
      banned      INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS wallets (
      jid         TEXT    PRIMARY KEY REFERENCES users(jid) ON DELETE CASCADE,
      cash        INTEGER NOT NULL DEFAULT 0,
      bank        INTEGER NOT NULL DEFAULT 0,
      bank_limit  INTEGER NOT NULL DEFAULT 10000,
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS stats (
      jid         TEXT    PRIMARY KEY REFERENCES users(jid) ON DELETE CASCADE,
      hp          INTEGER NOT NULL DEFAULT 100,
      max_hp      INTEGER NOT NULL DEFAULT 100,
      atk         INTEGER NOT NULL DEFAULT 10,
      def         INTEGER NOT NULL DEFAULT 5,
      spd         INTEGER NOT NULL DEFAULT 10,
      weapon_id   TEXT,
      armor_id    TEXT,
      win         INTEGER NOT NULL DEFAULT 0,
      loss        INTEGER NOT NULL DEFAULT 0,
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS items (
      id          TEXT    PRIMARY KEY,
      name        TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      category    TEXT    NOT NULL DEFAULT 'misc',
      price       INTEGER NOT NULL DEFAULT 0,
      sellable    INTEGER NOT NULL DEFAULT 1,
      stackable   INTEGER NOT NULL DEFAULT 1,
      rarity      TEXT    NOT NULL DEFAULT 'common',
      data        TEXT    NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS inventories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      jid         TEXT    NOT NULL REFERENCES users(jid) ON DELETE CASCADE,
      item_id     TEXT    NOT NULL REFERENCES items(id),
      quantity    INTEGER NOT NULL DEFAULT 1,
      data        TEXT    NOT NULL DEFAULT '{}',
      created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(jid, item_id)
    );

    CREATE TABLE IF NOT EXISTS quests (
      id          TEXT    PRIMARY KEY,
      name        TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      type        TEXT    NOT NULL DEFAULT 'daily',
      goal        INTEGER NOT NULL DEFAULT 1,
      reward_cash INTEGER NOT NULL DEFAULT 0,
      reward_exp  INTEGER NOT NULL DEFAULT 0,
      reward_item TEXT
    );

    CREATE TABLE IF NOT EXISTS user_quests (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      jid         TEXT    NOT NULL REFERENCES users(jid) ON DELETE CASCADE,
      quest_id    TEXT    NOT NULL REFERENCES quests(id),
      progress    INTEGER NOT NULL DEFAULT 0,
      completed   INTEGER NOT NULL DEFAULT 0,
      claimed     INTEGER NOT NULL DEFAULT 0,
      reset_at    INTEGER NOT NULL DEFAULT 0,
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(jid, quest_id)
    );

    CREATE TABLE IF NOT EXISTS groups (
      jid         TEXT    PRIMARY KEY,
      name        TEXT    NOT NULL DEFAULT '',
      prefix      TEXT,
      welcome     INTEGER NOT NULL DEFAULT 0,
      welcome_msg TEXT    NOT NULL DEFAULT '',
      antilink    INTEGER NOT NULL DEFAULT 0,
      antiflood   INTEGER NOT NULL DEFAULT 0,
      nsfw        INTEGER NOT NULL DEFAULT 0,
      mute        INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS cooldowns (
      key         TEXT    PRIMARY KEY,
      expires_at  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      from_jid    TEXT    NOT NULL,
      to_jid      TEXT,
      amount      INTEGER NOT NULL,
      type        TEXT    NOT NULL,
      note        TEXT    NOT NULL DEFAULT '',
      created_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS bot_settings (
      key         TEXT    PRIMARY KEY,
      value       TEXT    NOT NULL DEFAULT '',
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS warns (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      jid         TEXT    NOT NULL,
      group_jid   TEXT    NOT NULL,
      reason      TEXT    NOT NULL DEFAULT '',
      created_at  INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE INDEX IF NOT EXISTS idx_inventories_jid      ON inventories(jid);
    CREATE INDEX IF NOT EXISTS idx_transactions_from    ON transactions(from_jid);
    CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
    CREATE INDEX IF NOT EXISTS idx_cooldowns_expires    ON cooldowns(expires_at);
    CREATE INDEX IF NOT EXISTS idx_user_quests_jid      ON user_quests(jid);
    CREATE INDEX IF NOT EXISTS idx_users_level          ON users(level DESC);
    CREATE INDEX IF NOT EXISTS idx_warns_jid            ON warns(jid, group_jid);
  `)
  logger.info('Schema ready')
}

import { db } from '#storage/connection.js'
import { lazyPrepare } from '#storage/lazy.js'

const DAILY_RESET = 20 * 60 * 60
const WEEKLY_RESET = 7 * 24 * 60 * 60

class QuestModel {
  _findQuest = lazyPrepare('SELECT * FROM quests WHERE id = ?')
  _allQuests = lazyPrepare('SELECT * FROM quests ORDER BY type, id')
  _findProgress = lazyPrepare(`
    SELECT uq.*, q.name, q.description, q.goal, q.reward_cash, q.reward_exp, q.reward_item, q.type
    FROM user_quests uq JOIN quests q ON q.id = uq.quest_id
    WHERE uq.jid = @jid AND uq.quest_id = @questId
  `)
  _allProgress = lazyPrepare(`
    SELECT uq.*, q.name, q.description, q.goal, q.reward_cash, q.reward_exp, q.reward_item, q.type
    FROM user_quests uq JOIN quests q ON q.id = uq.quest_id
    WHERE uq.jid = ? ORDER BY q.type, uq.completed, uq.progress DESC
  `)
  _ensureProgress = lazyPrepare(`
    INSERT INTO user_quests (jid, quest_id, reset_at) VALUES (@jid, @questId, @resetAt)
    ON CONFLICT(jid, quest_id) DO NOTHING
  `)
  _addProgress = lazyPrepare(`
    UPDATE user_quests SET
      progress = MIN(progress + @amount, (SELECT goal FROM quests WHERE id = quest_id)),
      completed = CASE WHEN progress + @amount >= (SELECT goal FROM quests WHERE id = quest_id) THEN 1 ELSE 0 END,
      updated_at = unixepoch()
    WHERE jid = @jid AND quest_id = @questId AND completed = 0
  `)
  _claim = lazyPrepare(`
    UPDATE user_quests SET claimed = 1, updated_at = unixepoch()
    WHERE jid = @jid AND quest_id = @questId AND completed = 1 AND claimed = 0
  `)
  _resetExpired = lazyPrepare(`
    UPDATE user_quests SET progress = 0, completed = 0, claimed = 0,
      reset_at = unixepoch() + CASE
        WHEN (SELECT type FROM quests WHERE id = quest_id) = 'daily' THEN ${DAILY_RESET}
        WHEN (SELECT type FROM quests WHERE id = quest_id) = 'weekly' THEN ${WEEKLY_RESET}
        ELSE 0 END,
      updated_at = unixepoch()
    WHERE reset_at > 0 AND reset_at < unixepoch() AND claimed = 1
  `)
  _upsertQuest = lazyPrepare(`
    INSERT INTO quests (id, name, description, type, goal, reward_cash, reward_exp, reward_item)
      VALUES (@id, @name, @description, @type, @goal, @rewardCash, @rewardExp, @rewardItem)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, description=excluded.description, goal=excluded.goal,
      reward_cash=excluded.reward_cash, reward_exp=excluded.reward_exp, reward_item=excluded.reward_item
  `)

  findQuest(id) { return this._findQuest().get(id) ?? null }
  allQuests() { return this._allQuests().all() }
  getProgress(jid, questId) { return this._findProgress().get({ jid, questId }) ?? null }

  getAllProgress(jid) {
    this._resetExpired().run()
    return this._allProgress().all(jid)
  }

  ensure(jid, questId) {
    const quest = this._findQuest().get(questId)
    if (!quest) return
    const resetAt = quest.type === 'story' ? 0
      : Math.floor(Date.now() / 1000) + (quest.type === 'weekly' ? WEEKLY_RESET : DAILY_RESET)
    this._ensureProgress().run({ jid, questId, resetAt })
  }

  addProgress(jid, questId, amount = 1) {
    this.ensure(jid, questId)
    this._addProgress().run({ jid, questId, amount })
    return this._findProgress().get({ jid, questId })
  }

  claim(jid, questId) { return this._claim().run({ jid, questId }).changes > 0 }

  upsertQuest(quest) {
    this._upsertQuest().run({
      id: quest.id, name: quest.name, description: quest.description ?? '',
      type: quest.type ?? 'daily', goal: quest.goal ?? 1,
      rewardCash: quest.rewardCash ?? 0, rewardExp: quest.rewardExp ?? 0,
      rewardItem: quest.rewardItem ?? null,
    })
  }

  bulkUpsert(quests) { db.transaction(() => quests.forEach(q => this.upsertQuest(q)))() }
}

export const questModel = new QuestModel()

import { db } from './connection.js'

export function lazyPrepare(sql) {
  let stmt = null
  return () => {
    if (!stmt) stmt = db.prepare(sql)
    return stmt
  }
}

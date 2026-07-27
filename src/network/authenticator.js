import { useMultiFileAuthState } from 'baileys'
import { mkdir } from 'fs/promises'
import SETTINGS from '#environment/settings.js'
import { logger } from '#helpers/logger.js'

export async function useAuthState(sessionPath) {
  if (process.env.AUTH_BACKEND === 'sqlite') {
    const { useSQLiteAuthState } = await import('./sqlite-store.js')
    return useSQLiteAuthState(process.env.SESSION_ID ?? 'default')
  }

  await mkdir(sessionPath, { recursive: true })
  logger.debug({ sessionPath }, 'Auth: file-based (dev)')
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  return { state, saveCreds }
}

import 'dotenv/config'
import { resolve } from 'path'

const root = process.cwd()

const SETTINGS = Object.freeze({
  botName: process.env.BOT_NAME || 'HarunaBot',
  prefix: process.env.PREFIX || '!',
  sessionPath: resolve(root, process.env.SESSION_PATH || './sessions'),
  dbPath: resolve(root, process.env.DB_PATH || './data/harunabot.db'),
  logLevel: process.env.LOG_LEVEL || 'info',
  timezone: process.env.TIMEZONE || 'Asia/Jakarta',
  respondToSelf: process.env.RESPOND_TO_SELF === 'true',

  pairingNumber: (process.env.PAIRING_NUMBER || '').replace(/\D/g, '') || null,

  ownerNumber: (process.env.OWNER_NUMBER || '')
    .split(',')
    .map(n => n.trim())
    .filter(Boolean)
    .map(n => `${n.replace(/\D/g, '')}@s.whatsapp.net`),

  dashTerminal: process.env.DASH_TERMINAL === 'true',

  openaiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  anthropicKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
  groqKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
})

export default SETTINGS

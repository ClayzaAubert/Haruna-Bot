import 'dotenv/config'

const SETTINGS = Object.freeze({
  botName: process.env.BOT_NAME || 'HarunaBot',
  prefix: process.env.PREFIX || '!',
  sessionPath: process.env.SESSION_PATH || './sessions',
  dbPath: process.env.DB_PATH || './data/harunabot.db',
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
})

export default SETTINGS

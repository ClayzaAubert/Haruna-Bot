# AkaneBot — Production WhatsApp Bot Framework

> Built on [Baileys](https://baileys.wiki) · Node.js ESM · Plugin-based architecture
 opencode -s ses_05ed87b68ffeT1tk7napH4luEb
---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in env
cp .env.example .env

# 3. Start (dev mode with --watch)
npm run dev

# 4. Production
npm start
```

---

## 📁 Project Structure

```
src/
├── app.js                  ← Bootstrap & anti-crash
├── config/
│   ├── index.js            ← Env loader (single source of truth)
│   └── constants.js        ← Magic numbers / limits
├── core/
│   ├── registry.js         ← Command Map (name + aliases → command)
│   ├── serializer.js       ← Normalizes raw Baileys protos → clean object
│   ├── context.js          ← ctx builder (ctx.reply, ctx.react, etc.)
│   ├── router.js           ← Prefix detection → command dispatch
│   └── loader.js           ← Dynamic import of commands & plugins
├── handlers/
│   ├── message.handler.js  ← messages.upsert entry point
│   └── connection.handler.js ← Reconnect / QR / logout logic
├── events/
│   └── index.js            ← All sock.ev.on() in one place
├── middleware/
│   ├── index.js            ← Pipeline runner
│   ├── cooldown.js         ← Per-user per-command rate limiting
│   ├── ownerOnly.js
│   ├── groupOnly.js
│   ├── privateOnly.js
│   └── adminOnly.js
├── commands/
│   ├── general/            ← Public commands
│   │   ├── ping.js
│   │   ├── help.js
│   │   └── info.js
│   └── owner/              ← Restricted commands
│       ├── eval.js
│       └── reload.js
├── services/
│   ├── sticker.service.js  ← Business logic (not in commands!)
│   └── downloader.service.js
├── plugins/
│   └── example.plugin.js   ← Auto-loaded at startup
├── utils/
│   ├── logger.js           ← Pino instance
│   ├── banner.js           ← Startup art
│   ├── jid.js              ← JID helpers
│   └── format.js           ← Duration, bytes, etc.
├── lib/
│   ├── socket.js           ← Socket factory (makeWASocket wrapper)
│   └── auth.js             ← Auth state abstraction
└── database/
    └── index.js            ← DB layer scaffold
```

---

## ✍️ Adding a Command

Create `src/commands/<category>/<name>.js`:

```js
export default {
  name:        'greet',
  aliases:     ['hi', 'hello'],
  category:    'general',
  description: 'Sapa pengguna',
  cooldown:    3_000,
  ownerOnly:   false,
  groupOnly:   false,
  adminOnly:   false,

  async execute(ctx) {
    await ctx.reply(`Halo, ${ctx.pushName}! 👋`)
  },
}
```

That's it. The loader picks it up automatically on next start (or `!reload greet`).

---

## 🔌 Adding a Plugin

Create `src/plugins/myplugin.plugin.js`:

```js
export default {
  name: 'my-plugin',
  async init() {
    // runs once at startup
  },
  async destroy() {
    // cleanup on unload
  },
}
```

---

## 🛡️ Middleware Flags (on command object)

| Flag           | Effect                              |
|----------------|-------------------------------------|
| `ownerOnly: true`   | Only OWNER_NUMBER can use it    |
| `groupOnly: true`   | Groups only                     |
| `privateOnly: true` | DM only                         |
| `adminOnly: true`   | Group admins + owner only       |
| `cooldown: <ms>`    | Per-user cooldown (0 = disabled)|

---

## 🔮 Production Checklist

- [ ] Replace `useMultiFileAuthState` with a DB-backed auth state
- [ ] Implement `getMessage()` in `lib/socket.js` to read from your DB
- [ ] Add `cachedGroupMetadata` population from your DB on startup
- [ ] Set `LOG_LEVEL=warn` in production
- [ ] Use PM2 / systemd for process management
- [ ] Set up Redis for cooldowns (swap NodeCache in `middleware/cooldown.js`)

---

## 🧩 Recommended Additions

| Feature           | Suggested approach                          |
|-------------------|---------------------------------------------|
| Database          | Prisma + PostgreSQL or better-sqlite3       |
| Caching           | ioredis                                     |
| Job Queue         | BullMQ (Redis-backed)                       |
| Cron Jobs         | node-cron in a plugin                       |
| REST API          | Fastify in a plugin                         |
| Dashboard         | Separate service, reads same DB             |
| Multi-session     | Run multiple app.js instances, one per JID  |
| AI Integration    | OpenAI/Anthropic SDK in a service           |

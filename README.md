<p align="center">
  <img src="https://img.shields.io/badge/Version-4.0.0--beta-ff69b4?style=for-the-badge" alt="Beta 4.0.0">
  <img src="https://img.shields.io/badge/Node-%3E%3D20-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node >= 20">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/ESM-FFD700?style=for-the-badge&logo=javascript&logoColor=black" alt="ESM">
</p>

<h1 align="center">HarunaBot</h1>

<p align="center">
  <strong>Beta Test v4.0.0</strong> — <em>WhatsApp bot framework powered by Baileys, Node.js ESM, and SQLite.</em><br>
  Modular architecture with RPG, economy, AI, media processing, and terminal UI.
</p>

<p align="center">
  <b>Author</b> — <a href="https://github.com/ClayzaAubert">Clayza Aubert</a><br>
  <b>Based on</b> — <a href="https://github.com/Arifzyn19/akanebot">Akanebot</a> (original codebase)
</p>

---

## Quick Start

```bash
npm install
cp .env.example .env     # fill in your config
npm run dev              # dev mode with --watch
npm start                # production
```

---

## Terminal UI

Set `DASH_TERMINAL=true` in `.env` to enable the blessed-based TUI dashboard — a full-screen alternate terminal with keyboard navigation, live logs, and system monitoring.

```
┌─────────────────────────────────────────────────────┐
│  ░█░█░█▀▄░█▄░█              ● Online               │
│  ░█▀█░█▀▄░█░▀█              v4.0.0                 │
│  ░▀░▀░▀░▀░▀░░▀                                      │
├──────────────────┬──────────────────────────────────┤
│                  │  System Overview                 │
│  ▶ Dashboard     │                                  │
│    System Info   │  ● Node     v22.16.0             │
│    Services      │  ● Platform win32 / x64          │
│    Logs          │  ● Uptime   0d 0h 0m             │
│    About         │  ● RAM      10.5/15.7GB (67%)    │
│                  │                                  │
│                  │  Modules                         │
│                  │  ● Commands 55                   │
│                  │  ● Extensions 5                  │
├──────────────────┴──────────────────────────────────┤
│  ↑↓ Navigate │ Enter Select │ R Refresh │ Q Quit   │
└─────────────────────────────────────────────────────┘
```

**Views:**
| Tab | Content |
|-----|---------|
| Dashboard | System overview + module summary |
| System Info | OS, hostname, RAM, PID, CWD |
| Services | DB, AI, commands, extensions status |
| Logs | Live pino log tail, color-coded, auto-refresh 2s |
| About | Version, author, credits |

Fallback console banner when `DASH_TERMINAL=false` or terminal < 80×20.

---

## Project Layout

```
src/
├── index.js                       # Entry point
├── boot/bootstrap.js              # Init: DB → commands → extensions → socket → events
│
├── environment/                   # Configuration layer
│   ├── settings.js                # .env loader
│   └── limits.js                  # Cooldowns, TTLs, reconnect limits
│
├── helpers/                       # Utilities
│   ├── logger.js                  # Pino (pretty / TUI stream)
│   ├── formatter.js               # formatDuration, formatBytes
│   ├── identifier.js              # JID helpers, isStatus()
│   └── ascii-banner.js            # Console fallback banner
│
├── storage/                       # Database (better-sqlite3, WAL mode)
│   ├── connection.js / definitions.js / initializer.js
│   ├── lazy.js / migration.js
│   ├── models/                    # user, wallet, stats, group, cooldown, item, inventory, quest, bot-config
│   └── seeds/                     # 14 items + 5 quests
│
├── network/                       # WhatsApp connectivity
│   ├── client.js / authenticator.js / sqlite-store.js
│
├── events/                        # Baileys event handlers
│   ├── registry.js / message-pipeline.js / connection-watcher.js / group-observer.js
│
├── messages/                      # Message pipeline
│   ├── parser.js / context.js / dispatcher.js
│
├── commands/                      # Auto-loaded by category
│   ├── registry.js / loader.js / index.js
│   └── modules/
│       ├── general/   owner/     group/
│       ├── economy/   rpg/       shop/
│       ├── utility/   downloader/
│
├── guards/                        # Middleware pipeline
│   ├── pipeline.js
│   ├── throttles/                 # rate-limiter, cooldown
│   └── restrictions/              # ban, owner, premium, group, private, admin
│
├── features/                      # Business logic
│   ├── ai.js                      # OpenAI / Anthropic / Groq
│   ├── broadcast.js / downloader.js
│   ├── combat/                    # battle (PvP), dungeon (PvE), rob
│   ├── economy/                   # lootbox (gacha), shop
│   ├── media/                     # sticker (ffmpeg WebP + EXIF)
│   └── platforms/                 # youtube, tiktok, instagram, facebook
│
├── extensions/                    # Plugin system
│   ├── lifecycle/orchestrator.js
│   ├── safety/                    # anti-flood, anti-link
│   └── maintenance/               # cooldown-cleaner, scheduler
│
└── tui/                           # Blessed terminal dashboard
    ├── index.js                   # Screen, menu, 5 views, key bindings
    ├── log-store.js               # Ring buffer
    └── log-stream.js              # Pino → log-store
```

---

## Adding a Command

```js
export default {
  name:        'hello',
  aliases:     ['hi'],
  category:    'general',
  description: 'Greet the user',
  cooldown:    3_000,
  ownerOnly:   false,
  groupOnly:   false,
  privateOnly: false,
  adminOnly:   false,
  premiumOnly: false,

  async execute(ctx) {
    await ctx.reply(`Halo, ${ctx.pushName}!`)
  },
}
```

Multiple commands per file? Use named exports ending with `Command`:

```js
export const helloCommand = { name: 'hello', ... }
export const pingCommand = { name: 'ping', ... }
```

### Context API

| Method | Description |
|--------|-------------|
| `ctx.reply()` | Reply quoted to sender |
| `ctx.send()` | Send plain (unquoted) |
| `ctx.sendTo(jid)` | Send to specific chat |
| `ctx.react(emoji)` | React with emoji |
| `ctx.sendMedia()` | Image / video / audio / document |
| `ctx.sendLinkPreview()` | Text + link card |
| `ctx.downloadMedia()` | Download attached media |
| `ctx.typing()` / `ctx.stopTyping()` | Typing indicator |
| `ctx.isOwner()` | Check if sender is owner |

---

## Guard Pipeline

Ordered middleware chain before every command:

```
ban-check → rate-limiter → cooldown → owner-only → premium-only → group-only → private-only → admin-only
```

Cheapest checks first (in-memory / O(1) DB), most expensive last (group metadata fetch).

---

## Features

| Feature | Tech |
|---------|------|
| AI Chat | OpenAI, Anthropic, Groq |
| Economy | Cash, bank, daily, work, crime, slots, roulette, coinflip |
| RPG | PvP battle, PvE dungeon, XP/level, equipment, stats |
| Shop | Buy, sell, equip, lootbox (gacha with rarity weights) |
| Sticker | Image/video → WebP with EXIF metadata (ffmpeg) |
| Downloader | YouTube, TikTok, Instagram, Facebook |
| Media | Translate, TTS, weather, Wikipedia |
| Group Mgmt | Kick, promote, demote, tagall, warn, welcome, settings |
| Owner Tools | Eval, reload, ban, broadcast, premium, system stats |
| Security | Rate limiter, cooldowns, ban check, admin check, anti-flood, anti-link |

---

## Database

- **Engine:** better-sqlite3 (synchronous, WAL mode)
- **Pattern:** DAO per entity (user, wallet, stats, item, inventory, quest, group, cooldown)
- **SQL:** Prepared statements via `lazyPrepare()` (deferred compilation)

---

## Extensions

Extensions hook into the message pipeline via `processMessage(msg, sock)`. Return `false` to stop message from reaching commands.

| Extension | Purpose |
|-----------|---------|
| anti-flood | Per-group message rate limiting |
| anti-link | Auto-delete messages with links |
| cooldown-cleaner | Periodic expired cooldown cleanup |
| scheduler | Premium expiry, daily stats reset |

---

## Environment

Key variables in `.env` — full list in `.env.example`.

| Variable | Description |
|----------|-------------|
| `BOT_NAME` | Bot display name |
| `PREFIX` | Command prefix (default `.`) |
| `OWNER_NUMBER` | Owner WhatsApp number |
| `OPENAI_API_KEY` | AI provider key (or Anthropic/Groq) |
| `DASH_TERMINAL` | `true` for TUI dashboard |
| `LOG_LEVEL` | pino log level |

---

## License

MIT

# HarunaBot

WhatsApp bot framework powered by [Baileys](https://baileys.wiki), Node.js ESM, better-sqlite3, and modular architecture.

> **Author** — [Clayza Aubert](https://github.com/ClayzaAubert)  
> **Based on** — [Akanebot](https://github.com/Arifzyn19/akanebot) (original codebase)

---

## Quick Start

```bash
npm install
cp .env.example .env
# fill in your env, then:
npm run dev    # dev mode with --watch
npm start      # production
```

---

## Project Structure

```
src/
├── index.js                   # Entry point
├── boot/
│   └── bootstrap.js           # Init sequence: DB → commands → extensions → socket → events
├── environment/
│   ├── settings.js            # .env-based config (prefix, owner, paths, AI keys)
│   └── limits.js              # Cooldowns, reconnect limits, TTLs
├── helpers/
│   ├── logger.js              # Pino with pino-pretty dev / TUI log stream
│   ├── formatter.js           # formatDuration, formatBytes, formatNumber
│   ├── identifier.js          # JID/phone helpers, isStatus()
│   └── ascii-banner.js        # Console startup banner
├── storage/
│   ├── connection.js          # better-sqlite3 singleton (WAL mode)
│   ├── definitions.js         # CREATE TABLE + indexes
│   ├── initializer.js         # configureDatabase → createSchema
│   ├── lazy.js                # lazyPrepare — deferred statement compilation
│   ├── migration.js           # npm run db:migrate
│   ├── models/                # Data access objects
│   │   ├── user.js            # CRUD, exp/level, premium, ban, leaderboard
│   │   ├── wallet.js          # cash, bank, transfer, deposit, withdraw
│   │   ├── stats.js           # RPG stats: HP, ATK, DEF, SPD, equipment, W/L
│   │   ├── group.js           # Group settings
│   │   ├── cooldown.js        # DB-backed cooldowns
│   │   ├── item.js / inventory.js / quest.js
│   │   └── bot-config.js      # Key-value runtime settings
│   └── seeds/                 # 14 items + 5 quests
├── network/
│   ├── client.js              # makeWASocket factory
│   ├── authenticator.js       # Auth backend (file or SQLite)
│   └── sqlite-store.js        # Baileys auth state in SQLite
├── events/
│   ├── registry.js            # Bind all sock.ev.on()
│   ├── message-pipeline.js    # messages.upsert → processors → AI → dispatch
│   ├── connection-watcher.js  # Reconnect, QR, pairing code
│   └── group-observer.js      # Welcome/leave messages
├── messages/
│   ├── parser.js              # Normalize Baileys raw messages (v7 LID-aware)
│   ├── context.js             # ctx builder: reply, send, react, sendMedia, downloadMedia
│   └── dispatcher.js          # Prefix detection → guards → command.execute
├── commands/
│   ├── registry.js / loader.js / index.js
│   └── modules/               # Auto-loaded by category
│       ├── general/           # ping, info, help
│       ├── owner/             # eval, reload, ban, broadcast, botsetting, stats, system, premium, tools
│       ├── group/             # kick, promote, demote, tagall, warn, groupset, welcome, groupinfo
│       ├── economy/           # balance, daily, transfer, bank, slots, roulette, coinflip, work, crime, inventory, history
│       ├── rpg/               # battle, dungeon, profile, heal, quest, leaderboard, fish, mine, rob
│       ├── shop/              # shop, buy, sell, equip, lootbox
│       ├── utility/           # sticker, toimg, ai, translate, tts, cuaca, wiki
│       └── downloader/        # youtube, tiktok, instagram, facebook
├── guards/                    # Middleware pipeline
│   ├── pipeline.js            # runGuardChain — ordered pipeline
│   ├── throttles/
│   │   ├── rate-limiter.js    # 15 cmd/min per user (NodeCache)
│   │   └── cooldown.js        # DB-backed per-command cooldown
│   └── restrictions/
│       ├── ban-check.js / owner-only.js / premium-only.js
│       └── group-only.js / private-only.js / admin-only.js
├── features/                  # Business logic
│   ├── ai.js                  # Multi-provider AI (OpenAI, Anthropic, Groq)
│   ├── broadcast.js / downloader.js
│   ├── combat/
│   │   ├── battle.js          # PvP turn-based
│   │   ├── dungeon.js         # PvE monster battles
│   │   └── rob.js             # ATK vs DEF robbery
│   ├── economy/
│   │   ├── lootbox.js         # Weighted gacha (common 60% → legendary 1%)
│   │   └── shop.js            # Buy/sell/equip
│   ├── media/
│   │   └── sticker.js         # Image/video → WebP (ffmpeg) + EXIF
│   └── platforms/             # youtube, tiktok, instagram, facebook resolution
├── extensions/                # Plugin/hook system
│   ├── lifecycle/orchestrator.js  # ExtensionManager: register + runProcessors
│   ├── safety/                # anti-flood, anti-link
│   └── maintenance/           # cooldown-cleaner, scheduler
├── tui/                       # Terminal UI dashboard (blessed)
│   ├── index.js               # Screen, menu, 5 views, keyboard bindings
│   ├── log-store.js           # Ring buffer (500 lines)
│   └── log-stream.js          # Pino Writable → log-store
└── boot/
    └── bootstrap.js           # DB → commands → extensions → socket → events
```

---

## Terminal UI

Set `DASH_TERMINAL=true` in `.env` to enable the blessed-based TUI dashboard:

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

- **Dashboard** — system overview + module summary
- **System Info** — OS, hostname, RAM, PID, CWD
- **Services** — database, AI, commands, extensions status
- **Logs** — live pino log tail with color levels, auto-refresh every 2s
- **About** — version, author, credits

Fallback: when `DASH_TERMINAL=false` or terminal < 80×20, prints a clean console banner.

---

## Adding a Command

Create `src/commands/modules/<category>/<name>.js`:

```js
export default {
  name:        'hello',
  aliases:     ['hi'],
  category:    'general',
  description: 'Sapa pengguna',
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

---

## Guard Pipeline

Ordered middleware chain before every command:

```
ban-check → rate-limiter → cooldown → owner-only → premium-only → group-only → private-only → admin-only
```

Cheapest checks first (O(1) DB), most expensive last (group metadata fetch).

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BOT_NAME` | Bot display name |
| `PREFIX` | Command prefix (default `.`) |
| `OWNER_NUMBER` | Owner JID |
| `OPENAI_API_KEY` | AI provider (or Anthropic/Groq) |
| `DASH_TERMINAL` | `true` for TUI dashboard |
| `LOG_LEVEL` | pino log level |

Full list in `.env.example`.

---

## License

MIT

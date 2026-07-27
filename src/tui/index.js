import { freemem, totalmem, platform, arch, hostname } from 'os'
import { createRequire } from 'module'
import { logBuffer } from '#tui/log-store.js'

const blessed = createRequire(import.meta.url)('blessed')
const rf = createRequire(import.meta.url)
const APP_VERSION = rf('../../package.json').version

function size(n) { return (n / 1073741824).toFixed(1) + ' GB' }

function sysInfo() {
  let rt = 0, rf = 0, os = '?', a = '?'
  try { rt = totalmem(); rf = freemem(); os = platform(); a = arch() } catch {}
  const u = process.uptime()
  return {
    node: process.version,
    platform: os + ' / ' + a,
    host: hostname(),
    uptime: Math.floor(u / 86400) + 'd ' + Math.floor((u % 86400) / 3600) + 'h ' + Math.floor((u % 3600) / 60) + 'm',
    ram: size(rt - rf) + ' / ' + size(rt) + ' (' + (rt ? ((rt - rf) / rt * 100).toFixed(0) : '?') + '%)',
    pm2: !!process.env.PM2_HOME,
  }
}

const views = ['dashboard', 'system', 'services', 'logs', 'about']
const viewLabels = ['Dashboard', 'System Info', 'Services', 'Logs', 'About']

function sTitle(t) { return '{bold}{white-fg}' + t + '{/white-fg}{/bold}' }
function sItem(k, v) {
  return '  {cyan-fg}\u25cf{/cyan-fg}  {white-fg}' + k + '{/white-fg}' + ' '.repeat(Math.max(1, 14 - k.length)) + '{white-fg}' + v + '{/white-fg}'
}
function sSep() { return '   {cyan-fg}\u2500{/cyan-fg}'.repeat(40) }

function dash(sys, info) {
  const lines = [
    '',
    '   ' + sTitle('System Overview'),
    '',
    sItem('Node', sys.node),
    sItem('Platform', sys.platform),
    sItem('Host', sys.host),
    sItem('Uptime', sys.uptime),
    sItem('RAM', sys.ram),
    '',
    '   ' + sTitle('Modules'),
    '',
    sItem('Commands', String(info.commands ?? 0)),
    sItem('Extensions', String(info.extensions ?? 0)),
    sItem('Database', '{green-fg}\u25cf{/green-fg}  ' + (info.db ?? '?')),
    sItem('AI', info.ai !== 'none' ? '{green-fg}' + info.ai + '{/green-fg}' : '{white-fg}none{/white-fg}'),
    sys.pm2 ? sItem('PM2', '{green-fg}active{/green-fg}') : '',
    '',
    '   {white-fg}WhatsApp Bot Framework \u2014 Baileys{/white-fg}',
  ]
  return lines.filter(Boolean).join('\n')
}

function sysview(sys) {
  const lines = [
    '',
    '   ' + sTitle('System Info'),
    '',
    sSep(),
    '',
    sItem('OS', sys.platform),
    sItem('Hostname', sys.host),
    sItem('Node.js', sys.node),
    sItem('Uptime', sys.uptime),
    sItem('RAM', sys.ram),
    sItem('PID', String(process.pid)),
    sItem('CWD', process.cwd()),
    '',
    sSep(),
    '',
    '   {white-fg}R{/white-fg} {white-fg}to refresh{/white-fg}',
  ]
  return lines.join('\n')
}

function servview(info) {
  const db = info.db === 'SQLite'
  const ai = info.ai !== 'none'
  const badge = (on, label) => on ? '{green-fg}\u25cf{/green-fg}  {bold}{green-fg}' + label + '{/green-fg}{/bold}' : '{white-fg}\u25cb{/white-fg}  {white-fg}' + label + '{/white-fg}'
  const lines = [
    '',
    '   ' + sTitle('Services'),
    '',
    sSep(),
    '',
    '   ' + badge(db, 'Online'),
    '   {white-fg}Engine{/white-fg}    {white-fg}SQLite (better-sqlite3){/white-fg}',
    '   {white-fg}Path{/white-fg}     {white-fg}' + (info.db || '?') + '{/white-fg}',
    '',
    '   ' + badge(ai, 'Configured'),
    '   {white-fg}Provider{/white-fg}  {white-fg}' + (info.ai || 'none') + '{/white-fg}',
    '',
    '   {green-fg}\u25cf{/green-fg}  {bold}{green-fg}Commands{/green-fg}{/bold}',
    '   {white-fg}Loaded{/white-fg}   {white-fg}' + String(info.commands ?? 0) + '{/white-fg}',
    '',
    '   {green-fg}\u25cf{/green-fg}  {bold}{green-fg}Extensions{/green-fg}{/bold}',
    '   {white-fg}Loaded{/white-fg}   {white-fg}' + String(info.extensions ?? 0) + '{/white-fg}',
    '',
    sSep(),
    '',
    '   {white-fg}WhatsApp connection status will appear{/white-fg}',
    '   {white-fg}once the client is initialized.{/white-fg}',
  ]
  return lines.join('\n')
}

function logview() {
  const all = logBuffer.getAll()
  if (!all.length) return '\n   {white-fg}No logs yet.{/white-fg}'
  const lines = all.slice(-200)
  const out = lines.map(l => {
    if (l.includes('ERROR') || l.includes('FATAL')) return '   {red-fg}' + l + '{/red-fg}'
    if (l.includes('WARN')) return '   {yellow-fg}' + l + '{/yellow-fg}'
    if (l.includes('TRACE') || l.includes('DEBUG')) return '   {white-fg}' + l + '{/white-fg}'
    return '   {white-fg}' + l + '{/white-fg}'
  }).join('\n')
  return '\n' + out + '\n\n   {white-fg}Last ' + lines.length + ' lines  |  auto-refresh 2s{/white-fg}'
}

function aboutview(info) {
  const lines = [
    '',
    '   {magenta-fg}\u2591\u2588\u2591\u2588\u2591\u2588\u2580\u2584\u2591\u2588\u2584\u2591\u2588{/magenta-fg}',
    '   {magenta-fg}\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2584\u2591\u2588\u2591\u2580\u2588{/magenta-fg}',
    '   {magenta-fg}\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2591\u2580{/magenta-fg}  {bold}{white-fg}HarunaBot{/white-fg}{/bold}',
    '   {cyan-fg}v' + APP_VERSION + '{/cyan-fg}',
    '',
    '   {white-fg}WhatsApp bot framework powered by Baileys and SQLite.{/white-fg}',
    '',
    sSep(),
    '',
    '   {cyan-fg}\u25cf{/cyan-fg}  {bold}{white-fg}Author{/white-fg}{/bold}',
    '   {white-fg}       Clayza Aubert{/white-fg}',
    '   {cyan-fg}       https://github.com/ClayzaAubert{/cyan-fg}',
    '',
    '   {cyan-fg}\u25cf{/cyan-fg}  {bold}{white-fg}Based on{/white-fg}{/bold}',
    '   {white-fg}       Akanebot (original codebase){/white-fg}',
    '   {cyan-fg}       https://github.com/Arifzyn19/akanebot{/cyan-fg}',
    '',
    '   {cyan-fg}\u25cf{/cyan-fg}  {bold}{white-fg}License{/white-fg}{/bold}',
    '   {white-fg}       MIT{/white-fg}',
    '',
    '   {cyan-fg}\u25cf{/cyan-fg}  {bold}{white-fg}Runtime{/white-fg}{/bold}',
    '   {white-fg}       ' + process.version + '{/white-fg}',
    '',
    sSep(),
    '',
    '   {white-fg}WhatsApp Bot Framework{/white-fg}',
    '   {white-fg}Baileys \u2014 SQLite{/white-fg}',
  ]
  return lines.join('\n')
}

export function startTUI(info) {
  if (!process.stdout.isTTY) return false
  const cols = process.stdout.columns || 80
  const rows2 = process.stdout.rows || 20
  if (cols < 80 || rows2 < 20) return false

  const sys = sysInfo()
  let cur = 0
  let logTimer = null

  const BORDER = '#9999aa'

  const screen = blessed.screen({
    smartCSR: true,
    title: 'HRN v' + APP_VERSION,
    fullUnicode: true,
    dockBorders: true,
    cursor: { artificial: true, blink: true },
  })

  let rt
  screen.on('resize', () => { clearTimeout(rt); rt = setTimeout(() => screen.render(), 80) })

  const header = blessed.box({
    parent: screen, top: 0, left: 1, width: '100%-2', height: 3,
    style: { fg: 'white', bg: 'black' }, tags: true,
    content: '',
  })

  const menu = blessed.list({
    parent: screen, top: 3, left: 1, width: 22, height: '100%-5',
    border: { type: 'line', fg: BORDER },
    style: {
      fg: '#b0b0b0', bg: 'black',
      selected: { fg: 'white', bg: '#2a2a4a' },
      item: { fg: '#b0b0b0', bg: 'black' },
      border: { fg: BORDER },
    },
    keys: true, vi: true, mouse: true,
    items: viewLabels.map((_, i) => (i === 0 ? ' \u25b6 ' : '    ') + viewLabels[i]),
  })

  const content = blessed.box({
    parent: screen, top: 3, left: 23, width: '100%-24', height: '100%-5',
    border: { type: 'line', fg: BORDER },
    style: { fg: '#d0d0d0', bg: 'black' },
    tags: true, scrollable: true, alwaysScroll: true,
    scrollbar: { ch: '\u2588', fg: '#555555' },
  })

  const statusBar = blessed.box({
    parent: screen, bottom: 0, left: 0, width: '100%', height: 1,
    style: { fg: 'yellow', bg: '#1a1a1a' },
    content: '  \u2191\u2193 Navigate  \u2502  Enter Select  \u2502  R Refresh  \u2502  C Clear  \u2502  Q Quit',
  })

  function cleanup() {
    if (logTimer) clearInterval(logTimer)
    screen.destroy()
  }

  function renderHeader() {
    const pad = ' '.repeat(Math.max(0, cols - 32))
    const L = '{magenta-fg}'
    const E = '{/magenta-fg}'
    header.setContent(
      '  ' + L + '\u2591\u2588\u2591\u2588\u2591\u2588\u2580\u2584\u2591\u2588\u2584\u2591\u2588' + E + pad +
        '{green-fg}\u25cf{/green-fg}  {bold}{green-fg}Online{/green-fg}{/bold}\n' +
      '  ' + L + '\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2584\u2591\u2588\u2591\u2580\u2588' + E + pad +
        '{cyan-fg}v' + APP_VERSION + '{/cyan-fg}\n' +
      '  ' + L + '\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2591\u2580' + E
    )
  }

  function refresh(idx) {
    cur = idx
    menu.select(idx)
    menu.setItems(viewLabels.map((l, i) => (i === idx ? ' \u25b6 ' : '    ') + l))

    let body
    switch (idx) {
      case 0: body = dash(sysInfo(), info); break
      case 1: body = sysview(sysInfo()); break
      case 2: body = servview(info); break
      case 3: body = logview(); break
      case 4: body = aboutview(info); break
    }
    content.setContent(body || '')
    content.setScrollPerc(0)
    screen.render()
  }

  function startLogPoll() { logTimer = setInterval(() => { if (cur === 3) refresh(cur) }, 2000) }

  menu.on('select', (_, i) => { refresh(i); if (i !== 3 && logTimer) { clearInterval(logTimer); logTimer = null } })
  screen.key(['up', 'k'], () => refresh((cur - 1 + views.length) % views.length))
  screen.key(['down', 'j'], () => refresh((cur + 1) % views.length))
  screen.key(['r', 'R'], () => refresh(cur))
  screen.key(['c', 'C'], () => { logBuffer.clear(); if (cur === 3) refresh(cur) })
  screen.key(['tab'], () => refresh((cur + 1) % views.length))

  screen.key(['q', 'Q', 'C-c', 'escape'], () => {
    cleanup()
    process.exit(0)
  })

  renderHeader()
  refresh(0)
  startLogPoll()
  logBuffer.write('TUI dashboard started. Logs are captured here.')
}

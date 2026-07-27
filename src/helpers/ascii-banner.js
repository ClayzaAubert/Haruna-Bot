import { freemem, totalmem, platform, arch } from 'os'

const C = '\x1b[36m'
const G = '\x1b[32m'
const Y = '\x1b[33m'
const W = '\x1b[37m'
const D = '\x1b[2m'
const R = '\x1b[0m'

function strip(s) { return s.replace(/\x1b\[\d+m/g, '') }

export function printBanner() {}
export function printStatus(info) {
  let ramT = 0, ramF = 0, osP = '?', osA = '?'
  try { ramT = totalmem(); ramF = freemem(); osP = platform(); osA = arch() } catch {}

  const pm2 = !!process.env.PM2_HOME
  const node = process.version
  const up = process.uptime()
  const upStr = Math.floor(up / 60) + 'm ' + Math.floor(up % 60) + 's'
  const used = ramT - ramF
  const pct = ramT ? (used / ramT * 100).toFixed(0) : '?'
  const gb = (n) => (n / 1073741824).toFixed(1) + 'GB'
  const memStr = gb(used) + ' / ' + gb(ramT) + ' (' + pct + '%)'

  const BOX = 55
  const vis = (s) => strip(s).length
  const top = (t) => C + '\u250c' + R + ' ' + t + ' ' + C + '\u2500'.repeat(BOX - 4 - vis(t)) + '\u2510' + R
  const row = (s) => {
    const p = BOX - 4 - vis(s)
    return C + '\u2502' + R + ' ' + s + ' '.repeat(p) + C + ' \u2502' + R
  }
  const sep = () => C + '\u251c' + '\u2500'.repeat(BOX - 2) + '\u2524' + R
  const bot = () => C + '\u2514' + '\u2500'.repeat(BOX - 2) + '\u2518' + R

  const label = (s) => D + s + R
  const val = (s) => W + s
  const ok = (s) => G + s
  const dim = (s) => D + s
  const cell = (lLab, lVal, rLab, rVal) => {
    const left = label(lLab) + ' ' + val(lVal)
    const right = label(rLab) + ' ' + rVal
    return row(left + '  ' + right)
  }

  const lines = [
    '',
    top(W + 'HarunaBot' + C + '  ' + G + (info.version ?? '3.0.0') + C + '  \u2014  by ' + W + (info.author ?? 'unknown')),
    sep(),
    cell('Node', node, 'Commands', ok(String(info.commands ?? 0))),
    cell('Platform', osP + ' / ' + osA, 'Extensions', ok(String(info.extensions ?? 0))),
    cell('Uptime', upStr, 'DB', ok(info.db ?? '?')),
    cell('RAM', memStr, 'AI', info.ai !== 'none' ? ok(info.ai) : dim(info.ai ?? 'none')),
    pm2 ? cell('PM2', ok('active'), '', '') : '',
    sep(),
    row(dim('Author') + '    ' + W + 'Clayza Aubert'),
    row('         ' + C + 'https://github.com/ClayzaAubert'),
    row(dim('Based on') + '  ' + W + 'Akanebot (original codebase)'),
    row('         ' + C + 'https://github.com/Arifzyn19/akanebot'),
    sep(),
    row(dim('WhatsApp Bot Framework ') + C + '\u2014' + dim(' Baileys')),
    bot(),
    '',
  ]

  process.stderr.write(lines.filter(Boolean).join('\n'))
}

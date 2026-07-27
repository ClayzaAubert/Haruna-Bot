import { readdirSync, statSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { pathToFileURL } from 'url'
import { commandRegistry } from './registry.js'
import { orchestrator } from '#extensions/lifecycle/orchestrator.js'
import { logger } from '#helpers/logger.js'

const MODULES_DIR = resolve('src/commands/modules')
const PLUGINS_DIR = resolve('src/extensions')
const IGNORE = new Set(['index.js', 'manager.js', 'orchestrator.js'])

function findJsFiles(dir) {
  const result = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) result.push(...findJsFiles(full))
    else if (entry.endsWith('.js') && !entry.startsWith('_') && !IGNORE.has(entry)) result.push(full)
  }
  return result
}

function registerCmd(cmd) {
  if (!cmd?.name || typeof cmd.execute !== 'function') return false
  commandRegistry.register(cmd)
  return true
}

export async function loadCommands() {
  if (!existsSync(MODULES_DIR)) { logger.warn('Commands dir not found'); return }
  const files = findJsFiles(MODULES_DIR)
  let loaded = 0, skipped = 0

  for (const file of files) {
    try {
      const mod = await import(pathToFileURL(file).href)

      if (mod.default && registerCmd(mod.default)) {
        loaded++
        continue
      }

      let namedCount = 0
      for (const [key, val] of Object.entries(mod)) {
        if (key !== 'default' && key.endsWith('Command') && registerCmd(val)) {
          namedCount++
        }
      }

      if (namedCount > 0) { loaded += namedCount; continue }

      skipped++
      logger.warn({ file }, 'No valid command export')

    } catch (err) {
      logger.error({ err, file }, 'Failed to load command')
    }
  }
  logger.info(`Commands: ${loaded} loaded, ${skipped} skipped`)
}

export async function loadExtensions() {
  if (!existsSync(PLUGINS_DIR)) { logger.warn('Extensions dir not found'); return }
  const files = findJsFiles(PLUGINS_DIR)
  let loaded = 0

  for (const file of files) {
    try {
      const mod = await import(pathToFileURL(file).href)
      const ext = mod.default
      if (!ext) continue
      if (typeof ext.init === 'function') await ext.init()
      orchestrator.register(ext)
      loaded++
      logger.debug({ name: ext.name ?? file }, 'Extension loaded')
    } catch (err) {
      logger.error({ err, file }, 'Failed to load extension')
    }
  }
  logger.info(`Extensions: ${loaded} loaded`)
}

export async function reloadCommand(file) {
  try {
    const url = `${pathToFileURL(file).href}?t=${Date.now()}`
    const mod = await import(url)
    let count = 0

    if (mod.default?.name) {
      commandRegistry.unregister(mod.default.name)
      commandRegistry.register(mod.default)
      count++
    }

    for (const [key, val] of Object.entries(mod)) {
      if (key !== 'default' && key.endsWith('Command') && val?.name) {
        commandRegistry.unregister(val.name)
        commandRegistry.register(val)
        count++
      }
    }

    if (count > 0) logger.info({ file, count }, 'Command(s) hot-reloaded')
    return count > 0
  } catch (err) {
    logger.error({ err, file }, 'Hot reload failed')
    return false
  }
}

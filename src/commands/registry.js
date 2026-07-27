class CommandRegistry {
  constructor() {
    this._commands = new Map()
    this._categories = new Map()
  }

  register(command) {
    if (!command?.name || typeof command.execute !== 'function') {
      throw new Error(`Invalid command: must have "name" and "execute". Got: ${JSON.stringify(command)}`)
    }

    this._commands.set(command.name.toLowerCase(), command)

    for (const alias of command.aliases ?? []) {
      this._commands.set(alias.toLowerCase(), command)
    }

    const cat = command.category ?? 'general'
    if (!this._categories.has(cat)) this._categories.set(cat, [])

    const list = this._categories.get(cat)
    if (!list.find(c => c.name === command.name)) list.push(command)
  }

  get(name) { return this._commands.get(name.toLowerCase()) }
  has(name) { return this._commands.has(name.toLowerCase()) }
  getByCategory(category) { return this._categories.get(category) ?? [] }
  getCategories() { return [...this._categories.keys()] }
  getAll() { return [...new Set(this._commands.values())] }
  count() { return this.getAll().length }

  unregister(name) {
    const cmd = this.get(name)
    if (!cmd) return
    this._commands.delete(cmd.name.toLowerCase())
    for (const alias of cmd.aliases ?? []) this._commands.delete(alias.toLowerCase())
    const cat = this._categories.get(cmd.category)
    if (cat) this._categories.set(cmd.category, cat.filter(c => c.name !== cmd.name))
  }
}

export const commandRegistry = new CommandRegistry()

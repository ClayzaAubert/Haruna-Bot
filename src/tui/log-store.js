const MAX = 500
const buffer = []

export const logBuffer = {
  write(str) {
    if (!str) return
    if (buffer.length >= MAX) buffer.shift()
    buffer.push(str)
  },
  getAll() { return [...buffer] },
  clear() { buffer.length = 0 },
  get length() { return buffer.length },
}

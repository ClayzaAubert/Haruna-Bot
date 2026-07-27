import axios from 'axios'
import { logger } from '#helpers/logger.js'

const SYSTEM_PROMPT = `Kamu adalah HarunaBot, asisten WhatsApp yang pintar dan ramah. 
Jawab dalam bahasa yang sama dengan pertanyaan user (Indonesia/English).
Jawaban singkat, padat, dan informatif. Maksimal 3 paragraf.`

class AIService {
  constructor() {
    this._provider = this._detect()
    if (this._provider) logger.info(`[AI] Provider: ${this._provider}`)
    else logger.debug('[AI] No API key configured')
  }

  _detect() {
    if (process.env.OPENAI_API_KEY) return 'openai'
    if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
    if (process.env.GROQ_API_KEY) return 'groq'
    return null
  }

  isAvailable() { return !!this._provider }

  async chat(prompt, history = []) {
    if (!this._provider) throw new Error('AI tidak tersedia — tambahkan API key di .env')
    return this[`_${this._provider}`](prompt, history)
  }

  async _openai(prompt, history) {
    const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history, { role: 'user', content: prompt }],
      max_tokens: 1000, temperature: 0.7,
    }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30_000 })
    return data.choices?.[0]?.message?.content?.trim() ?? 'Tidak ada respons.'
  }

  async _anthropic(prompt, history) {
    const { data } = await axios.post('https://api.anthropic.com/v1/messages', {
      model: process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5',
      max_tokens: 1000, system: SYSTEM_PROMPT,
      messages: [...history, { role: 'user', content: prompt }],
    }, { headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, timeout: 30_000 })
    return data.content?.[0]?.text?.trim() ?? 'Tidak ada respons.'
  }

  async _groq(prompt, history) {
    const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history, { role: 'user', content: prompt }],
      max_tokens: 1000, temperature: 0.7,
    }, { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30_000 })
    return data.choices?.[0]?.message?.content?.trim() ?? 'Tidak ada respons.'
  }
}

export const aiService = new AIService()

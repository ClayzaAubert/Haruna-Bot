import axios from 'axios'
import { logger } from '#helpers/logger.js'
import SETTINGS from '#environment/settings.js'

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
    if (SETTINGS.openaiKey) return 'openai'
    if (SETTINGS.anthropicKey) return 'anthropic'
    if (SETTINGS.groqKey) return 'groq'
    return null
  }

  isAvailable() { return !!this._provider }

  async chat(prompt, history = []) {
    if (!this._provider) throw new Error('AI tidak tersedia — tambahkan API key di .env')
    return this[`_${this._provider}`](prompt, history)
  }

  _extractContent(data, type) {
    if (type === 'openai') {
      return data?.choices?.[0]?.message?.content?.trim() ?? null
    }
    if (type === 'anthropic') {
      return data?.content?.[0]?.text?.trim() ?? null
    }
    if (type === 'groq') {
      return data?.choices?.[0]?.message?.content?.trim() ?? null
    }
    return null
  }

  async _openai(prompt, history) {
    const { data } = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: SETTINGS.openaiModel,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history, { role: 'user', content: prompt }],
      max_tokens: 1000, temperature: 0.7,
    }, { headers: { Authorization: `Bearer ${SETTINGS.openaiKey}`, 'Content-Type': 'application/json' }, timeout: 30_000 })

    const content = this._extractContent(data, 'openai')
    if (!content) throw new Error('OpenAI: unexpected response shape')
    return content
  }

  async _anthropic(prompt, history) {
    const { data } = await axios.post('https://api.anthropic.com/v1/messages', {
      model: SETTINGS.anthropicModel,
      max_tokens: 1000, system: SYSTEM_PROMPT,
      messages: [...history, { role: 'user', content: prompt }],
    }, { headers: { 'x-api-key': SETTINGS.anthropicKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, timeout: 30_000 })

    const content = this._extractContent(data, 'anthropic')
    if (!content) throw new Error('Anthropic: unexpected response shape')
    return content
  }

  async _groq(prompt, history) {
    const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: SETTINGS.groqModel,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history, { role: 'user', content: prompt }],
      max_tokens: 1000, temperature: 0.7,
    }, { headers: { Authorization: `Bearer ${SETTINGS.groqKey}`, 'Content-Type': 'application/json' }, timeout: 30_000 })

    const content = this._extractContent(data, 'groq')
    if (!content) throw new Error('Groq: unexpected response shape')
    return content
  }
}

export const aiService = new AIService()

import OpenAI from 'openai'
import { ENV } from '../config/env'

let _client: OpenAI | null = null

/**
 * Returns a lazily-initialized OpenAI client.
 * Returns null if OPENAI_API_KEY is not configured —
 * all callers must handle the null case and fall back
 * to deterministic logic (see PRD Section 6.4).
 */
export function getOpenAIClient(): OpenAI | null {
  if (_client) return _client
  if (!ENV.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set — AI routes will use deterministic fallback.')
    return null
  }
  _client = new OpenAI({ apiKey: ENV.OPENAI_API_KEY })
  return _client
}

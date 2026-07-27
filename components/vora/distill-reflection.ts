/** Helpers for written Lights — keep only what the Sky write path uses. */

import { hasHangul } from './text-script'

const FILLER_ONLY =
  /^(uh+|um+|hmm+|ah+|er+|\.+|…+)+$/i
const FILLER_WORD =
  /^(uh|um|hmm|ah|er|like|so|well|okay|ok|yes|no|ㅎ|ㅋ|ㅠ|ㅜ)$/i

/** Collapse whitespace so “I  am” matches “I am”. */
export function normalizeLightSentence(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

/**
 * True when text has at least one sentence — enough to become a star.
 * Soft breath, not grammar school: no required period; two sentences are fine.
 */
export function hasMeaningfulContent(raw: string): boolean {
  const text = normalizeLightSentence(raw)
  if (!text) return false

  const bare = text.replace(/[.!?。…]+$/g, '').trim()
  if (!bare) return false

  const lower = bare.toLowerCase()
  if (FILLER_ONLY.test(lower) || FILLER_WORD.test(lower)) return false

  // Clear sentence end — still needs a real breath before it.
  if (/[.!?。…]$/.test(text) && bare.length >= 2) {
    if (hasHangul(bare)) return [...bare.replace(/\s/g, '')].length >= 2
    return bare.split(' ').filter(Boolean).length >= 2 || bare.length >= 8
  }

  if (hasHangul(text)) {
    const syllables = [...bare.replace(/\s/g, '')].length
    const words = bare.split(' ').filter(Boolean).length
    // Short Korean sentence (“사랑해요”), or at least two spaced words.
    return syllables >= 4 || words >= 2
  }

  const words = bare.split(' ').filter(Boolean)
  if (words.length >= 3) return true
  if (words.length === 2 && words.every((w) => w.replace(/[^a-z0-9']/gi, '').length >= 2)) {
    return true
  }
  return false
}

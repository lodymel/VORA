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
 * True when text has enough breath to become a star.
 * Soft gate — no required period. “사랑해” / “I am enough” both pass.
 */
export function hasMeaningfulContent(raw: string): boolean {
  const text = normalizeLightSentence(raw)
  if (!text) return false

  const bare = text.replace(/[.!?。…]+$/g, '').trim()
  if (!bare) return false

  const lower = bare.toLowerCase()
  if (FILLER_ONLY.test(lower) || FILLER_WORD.test(lower)) return false

  if (hasHangul(bare)) {
    const syllables = [...bare.replace(/\s/g, '')].length
    const words = bare.split(' ').filter(Boolean).length
    // Two Hangul syllables = a real breath (“좋아”, “사랑해”). Period optional.
    return syllables >= 2 || words >= 2
  }

  const words = bare.split(' ').filter(Boolean)
  if (words.length >= 3) return true
  if (words.length === 2 && words.every((w) => w.replace(/[^a-z0-9']/gi, '').length >= 2)) {
    return true
  }
  // Short English with a clear end mark still needs a couple of letters.
  if (/[.!?。…]$/.test(text) && bare.length >= 4) return true
  return false
}

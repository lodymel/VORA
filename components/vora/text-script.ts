/** Hangul syllables + jamo — enough to detect Korean Lights. */
const HANGUL =
  /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7A3\uD7B0-\uD7FF]/

export function hasHangul(text: string): boolean {
  return HANGUL.test(text)
}

/**
 * Visual width units for line budgets.
 * Hangul squares read ~1.85× Latin — count them heavier so lines don’t overflow.
 */
export function measureTypoWidth(text: string): number {
  let w = 0
  for (const ch of text) {
    if (HANGUL.test(ch)) w += 1.85
    else if (/\s/.test(ch)) w += 0.35
    else w += 1
  }
  return w
}

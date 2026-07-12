/** Helpers for written Lights — keep only what the Sky write path uses. */

/** True when text carries enough meaning to save as a Light. */
export function hasMeaningfulContent(raw: string): boolean {
  const text = raw.trim().replace(/\s+/g, ' ')
  if (!text) return false

  const lower = text.toLowerCase().replace(/[.…!,?]+$/g, '')

  if (/^(uh+|um+|hmm+|ah+|er+|\.+|…+)+$/i.test(lower)) return false
  if (/^(uh|um|hmm|ah|er|like|so|well|okay|ok)$/i.test(lower)) return false
  if (text.length < 2) return false

  return true
}

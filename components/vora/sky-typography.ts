/** Balanced line stack — same brand voice, 1–3 lines by length (speech-safe). */
export function splitSentenceForDisplay(sentence: string): string[] {
  const trimmed = sentence.trim()
  if (!trimmed) return ['']

  const endsWithPeriod = trimmed.endsWith('.')
  const body = endsWithPeriod ? trimmed.slice(0, -1) : trimmed
  const words = body.split(/\s+/).filter(Boolean)
  const period = endsWithPeriod ? '.' : ''

  if (words.length <= 5) {
    return [trimmed]
  }

  if (words.length <= 10) {
    const mid = Math.ceil(words.length / 2)
    return [words.slice(0, mid).join(' '), `${words.slice(mid).join(' ')}${period}`]
  }

  const size = Math.ceil(words.length / 3)
  const lines: string[] = []
  for (let i = 0; i < words.length; i += size) {
    const chunk = words.slice(i, i + size)
    const isLast = i + size >= words.length
    lines.push(`${chunk.join(' ')}${isLast ? period : ''}`)
  }

  return lines.slice(0, 3)
}

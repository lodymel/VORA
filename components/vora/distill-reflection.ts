/** Distill written words into a positive Light — local rules until AI wired. */

const GENTLE_INVITES = [
  'You have more light to share.',
  'Your words matter. Keep going.',
  'Take your time. You are worth it.',
]

export function pickGentleInvite(): string {
  return GENTLE_INVITES[Math.floor(Math.random() * GENTLE_INVITES.length)]
}

/** True when text carries enough meaning to distill. */
export function hasMeaningfulContent(raw: string): boolean {
  const text = raw.trim().replace(/\s+/g, ' ')
  if (!text) return false

  const lower = text.toLowerCase().replace(/[.…!,?]+$/g, '')

  if (/^(uh+|um+|hmm+|ah+|er+|\.+|…+)+$/i.test(lower)) return false
  if (/^(uh|um|hmm|ah|er|like|so|well|okay|ok)$/i.test(lower)) return false
  if (text.length < 2) return false

  return true
}

export function reflectionNeedsReadMore(text: string): boolean {
  const lines = text.trim().split(/\n/)
  return lines.length > 4 || text.trim().length > 140
}

export function distillReflection(raw: string): string {
  const text = raw.trim().replace(/\s+/g, ' ')
  if (!text) return ''

  const lower = text.toLowerCase()

  if (/\b(happy|glad|joyful|content|grateful|thankful|lucky|proud|love|loved|confident|strong|success|winning|blessed)\b/.test(lower)) {
    return toPositiveLight(text)
  }
  if (/\b(sad|unhappy|down|low|lonely|alone|isolated)\b/.test(lower)) {
    return 'I am worthy of love and gentle care.'
  }
  if (/\b(exhausted|so tired|burnt out|burned out|drained)\b/.test(lower)) {
    return 'I am recharging my strength and power.'
  }
  if (/\b(hate today|hate this day|worst day|terrible day|bad day|hard day)\b/.test(lower)) {
    return 'I choose a brighter tomorrow for myself.'
  }
  if (/\b(anxious|worried|scared|afraid|nervous|doubt)\b/.test(lower)) {
    return 'I trust myself and move forward with confidence.'
  }
  if (/\b(fail|failure|not enough|worthless|stupid|ugly)\b/.test(lower)) {
    return 'I am enough, and I am becoming more each day.'
  }
  if (/\b(hopeful|optimistic|looking forward|excited)\b/.test(lower)) {
    return 'I am open to success, love, and beautiful things.'
  }

  return toPositiveLight(text)
}

function toPositiveLight(text: string): string {
  const cleaned = stripProfanity(text)
  const condensed = condenseLongReflection(cleaned)
  const sentence = condensed.charAt(0).toUpperCase() + condensed.slice(1)
  return sentence.endsWith('.') ? sentence : `${sentence}.`
}

/** Keep mirror reflections short — never dump long text into the glass. */
function condenseLongReflection(text: string): string {
  const words = text.split(/\s+/)
  if (words.length <= 24) return text

  const slice = words.slice(0, 20).join(' ')
  return `${slice.replace(/[,.…]+$/, '')}…`
}

function stripProfanity(text: string): string {
  return text
    .replace(/\b(fuck|fucking|shit|damn|bitch|asshole|crap|hell)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

import { hasHangul, measureTypoWidth } from './text-script'

export type AlbumTypoLines = {
  /** Setup — quieter lead-in (Instrument). Joined for aria / legacy. */
  primary: string
  /** Landing — the feeling (Rosemartin). */
  accent: string
  /** Explicit visual lines — Sky + Card MUST render these, never CSS-wrap freely. */
  primaryLines: string[]
  accentLines: string[]
}

const TINY = /^(am|is|me|my|to|a|an|the|of|in|on|at|for|and|or|with)$/i
/** Pronouns / copulas that must not end a visual line (unless before a punch word). */
const DANGLING = /^(i|i'm|im|am|is|are|was|were|be|to|my|me|that)$/i

/**
 * Strong landing openers — the punch often begins here.
 * “every step I take”, “never alone”, “always enough”
 */
const LANDING_HEAD =
  /^(every|never|always|only|still|once|again|already|finally|truly|fully)$/i

/**
 * Soft prepositional landings.
 * When a relative follows (`through who…`), soft stays on primary —
 * accent type is larger; “through who I am” overflows the mobile card.
 */
const SOFT_LANDING =
  /^(with|through|into|toward|towards|beyond|without|within|under|over|from|like|when|until|before|after|across|along)$/i

/** Relative heads — accent often starts here after a soft setup word. */
const RELATIVE_HEAD = /^(who|what|which|whose)$/i

/**
 * Soft budget — Sky + Card share identical breaks.
 * Card accent is larger type in a narrow inset; keep lines short enough for mobile.
 * Tuned to real phone measure (~14–16 glyphs) so nowrap lines keep air inside the card.
 */
const LINE_BUDGET = 16
/** Accent (Rosemartin) reads wider — tighter char budget than primary. */
const ACCENT_LINE_BUDGET = 14
/** Hangul squares — optical width budget (see measureTypoWidth). */
// measureTypoWidth already counts Hangul at 1.85 units. These budgets therefore
// yield roughly 10 / 9 syllables per line instead of double-penalising Korean
// into many tiny rows that overflow the card vertically.
const KR_LINE_BUDGET = 20
const KR_ACCENT_LINE_BUDGET = 18
/** Soft overshoot for poster binary splits — keep tiny; large slack overflows the card. */
const LINE_SLACK = 2

function cleanWord(word: string) {
  return word.replace(/[^\w']/g, '')
}

function isPunchWord(word: string) {
  const w = cleanWord(word)
  return (
    w.length >= 6 &&
    !TINY.test(w) &&
    !DANGLING.test(w) &&
    !RELATIVE_HEAD.test(w) &&
    !SOFT_LANDING.test(w)
  )
}

function findLastIndex(words: string[], test: (w: string) => boolean) {
  for (let i = words.length - 1; i >= 1; i--) {
    if (test(cleanWord(words[i] ?? ''))) return i
  }
  return -1
}

function scoreSplit(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) return -Infinity
  const l = left.join(' ')
  const r = right.join(' ')
  const lastL = cleanWord(left[left.length - 1] ?? '')
  const firstR = cleanWord(right[0] ?? '')
  let score = -Math.abs(l.length - r.length)

  // Prefer multi-word halves over stranding a lone weak word
  if (left.length === 1) score -= 18
  if (right.length === 1) score -= 22

  // Soft landing word alone (“through”) feels like a dropped stitch
  if (left.length === 1 && SOFT_LANDING.test(lastL)) score -= 36
  if (right.length === 1 && SOFT_LANDING.test(firstR)) score -= 48

  // Poster punch: substantial last word alone (“becoming.”) is intentional
  const punchAlone = right.length === 1 && isPunchWord(right[0] ?? '')
  if (punchAlone) score += 42

  // Never end a line on a hanging word — unless the next line is the punch
  if (DANGLING.test(lastL)) {
    score -= punchAlone && /^(i|am)$/i.test(lastL) ? 8 : 60
  } else if (TINY.test(lastL)) {
    score -= punchAlone ? 10 : 40
  } else if (/^(who|what|that)$/i.test(lastL)) {
    score -= 20
  }

  if (left.length === 1 && (TINY.test(lastL) || DANGLING.test(lastL))) score -= 20
  if (right.length === 1 && !punchAlone && (TINY.test(firstR) || DANGLING.test(firstR) || firstR.length <= 3)) {
    score -= 35
  }

  // “I am …” / “who I am” as a landing phrase is good
  if (firstR.toLowerCase() === 'i' && right.length >= 2) score += 10
  if (RELATIVE_HEAD.test(firstR) && right.length >= 2) score += 6

  return score
}

/** Best mid split for short phrases — poster balance over greedy wrap. */
function balancedBinary(words: string[]): string[] | null {
  if (words.length < 3 || words.length > 6) return null
  let bestAt = -1
  let bestScore = -Infinity
  for (let i = 1; i < words.length; i++) {
    const score = scoreSplit(words.slice(0, i), words.slice(i))
    if (score > bestScore) {
      bestScore = score
      bestAt = i
    }
  }
  if (bestAt < 1) return null
  return [words.slice(0, bestAt).join(' '), words.slice(bestAt).join(' ')]
}

/**
 * Pack words into visual lines. Never leave a short orphan alone on the last line.
 * This is the only place Sky/Card wrap is decided — CSS must not re-break.
 */
export function balancePhraseLines(text: string, maxChars = LINE_BUDGET): string[] {
  const words = text
    .replace(/\u00A0/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return []

  const joined = words.join(' ')

  // Fits the measure → one line.
  // Never force a couplet just because there are 4 words — “I can do it” is one breath.
  // Long tails (“I attract success through”, 25+) still binary-split below.
  if (measureTypoWidth(joined) <= maxChars) return [joined]

  // Two words over budget → stack (never one long nowrap that clips the card).
  if (words.length === 2) {
    return words.flatMap((word) => splitOverlongToken(word, maxChars))
  }
  // Korean is commonly entered without spaces. A single 20+ syllable token
  // must still receive explicit card-safe lines; nowrap CSS cannot rescue it.
  if (words.length === 1) return splitOverlongToken(joined, maxChars)

  // 3–6 words over budget: balanced binary poster split
  if (words.length <= 6) {
    const binary = balancedBinary(words)
    if (binary && binary.every((line) => measureTypoWidth(line) <= maxChars + LINE_SLACK)) {
      const weakCouplet = binary.some((line, index) => {
        if (index === 0) return false
        const first = cleanWord(line.split(/\s+/)[0] ?? '')
        return DANGLING.test(first) || (TINY.test(first) && first.length <= 3)
      })
      // Prefer one slightly long line over “that lift” / “me higher.”
      if (weakCouplet && measureTypoWidth(joined) <= maxChars + LINE_SLACK) return [joined]
      return binary
    }
  }

  const lines: string[] = []
  let current: string[] = []
  let len = 0

  for (const word of words) {
    const add =
      current.length === 0 ? measureTypoWidth(word) : measureTypoWidth(` ${word}`)
    if (current.length > 0 && len + add > maxChars) {
      lines.push(current.join(' '))
      current = [word]
      len = measureTypoWidth(word)
    } else {
      current.push(word)
      len += add
    }
  }
  if (current.length) lines.push(current.join(' '))

  // Pull orphan last line back — tiny last line is never ok (except a punch word)
  if (lines.length >= 2) {
    const lastParts = lines[lines.length - 1].split(' ')
    const lastWord = lastParts[0] ?? ''
    const orphan =
      lastParts.length === 1 &&
      !isPunchWord(lastWord) &&
      (lastWord.length <= 5 || TINY.test(cleanWord(lastWord)) || DANGLING.test(cleanWord(lastWord)))

    if (orphan) {
      const prevParts = lines[lines.length - 2].split(' ')
      if (prevParts.length >= 2) {
        const moved = prevParts.pop()!
        lines[lines.length - 2] = prevParts.join(' ')
        lines[lines.length - 1] = `${moved} ${lines[lines.length - 1]}`
      } else {
        lines[lines.length - 2] = `${lines[lines.length - 2]} ${lines[lines.length - 1]}`
        lines.pop()
      }
    }
  }

  // If a line still ends on a hanging word, pull that word onto the next line
  // (keep “who I am” | “becoming” — punch alone is intentional)
  for (let i = 0; i < lines.length - 1; i++) {
    const parts = lines[i].split(' ')
    const end = cleanWord(parts[parts.length - 1] ?? '')
    if (parts.length < 2) continue
    if (!(DANGLING.test(end) || TINY.test(end))) continue

    const nextParts = lines[i + 1].split(' ')
    if (
      nextParts.length === 1 &&
      isPunchWord(nextParts[0] ?? '') &&
      /^(i|am)$/i.test(end)
    ) {
      continue
    }

    const moved = parts.pop()!
    lines[i] = parts.join(' ')
    lines[i + 1] = `${moved} ${lines[i + 1]}`
  }

  // Final card-safe pass — orphan/dangling pulls can re-inflate a line past measure.
  // Hard-pack only (no second orphan dance) so nowrap ink stays inside Sky + Card.
  return hardPackOverBudget(lines.filter(Boolean), maxChars)
}

/** Re-pack any line that still exceeds the soft budget after editorial pulls. */
function hardPackOverBudget(lines: string[], maxChars: number): string[] {
  const out: string[] = []
  for (const line of lines) {
    const words = line
      .split(/\s+/)
      .filter(Boolean)
      .flatMap((word) => splitOverlongToken(word, maxChars))
    if (measureTypoWidth(line) <= maxChars + LINE_SLACK) {
      out.push(line)
      continue
    }
    let current: string[] = []
    let len = 0
    for (const word of words) {
      const add =
        current.length === 0 ? measureTypoWidth(word) : measureTypoWidth(` ${word}`)
      if (current.length > 0 && len + add > maxChars) {
        out.push(current.join(' '))
        current = [word]
        len = measureTypoWidth(word)
      } else {
        current.push(word)
        len += add
      }
    }
    if (current.length) out.push(current.join(' '))
  }
  return out
}

/** Split a space-free token by Unicode code points without cutting Hangul or emoji. */
function splitOverlongToken(token: string, maxChars: number): string[] {
  if (measureTypoWidth(token) <= maxChars + LINE_SLACK) return [token]

  const chunks: string[] = []
  let current = ''
  let width = 0
  for (const glyph of Array.from(token)) {
    const glyphWidth = measureTypoWidth(glyph)
    if (current && width + glyphWidth > maxChars) {
      chunks.push(current)
      current = glyph
      width = glyphWidth
    } else {
      current += glyph
      width += glyphWidth
    }
  }
  if (current) chunks.push(current)
  return chunks
}

function splitVoice(sentence: string): { primary: string; accent: string } {
  const trimmed = sentence.trim()
  if (!trimmed) return { primary: '', accent: '' }
  const hangul = hasHangul(trimmed)

  // Two breaths: "…. …." — keep the second sentence as the accent voice.
  const twoBreaths = trimmed.match(/^(.+?[.!?])\s+(\S[\s\S]*)$/)
  if (twoBreaths && twoBreaths[2].split(/\s+/).filter(Boolean).length >= 2) {
    return {
      primary: twoBreaths[1].trim(),
      accent: twoBreaths[2].trim(),
    }
  }

  const comma = trimmed.indexOf(',')
  if (comma !== -1) {
    const afterComma = trimmed.slice(comma + 1).trim()
    const clearTurn =
      /^(but|so|yet|still|instead|again|then|because|while|even|only|finally|truly)\b/i.test(
        afterComma,
      )
    // A comma can be a list, not an emphasis cue. Split only on an explicit turn.
    if (hangul || clearTurn) {
      return {
        primary: trimmed.slice(0, comma + 1).trim(),
        accent: afterComma,
      }
    }
  }

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length <= 1) return { primary: words[0] ?? '', accent: '' }

  if (!hangul) {
    // Explicit punctuation turns are strong enough to direct a second voice.
    const punctuationTurn = trimmed.match(/^(.+?(?:—|:|;))\s+(\S[\s\S]*)$/)
    if (punctuationTurn) {
      return { primary: punctuationTurn[1].trim(), accent: punctuationTurn[2].trim() }
    }

    // Relative clause: keep the noun it describes in the setup voice.
    const relativeTurn = trimmed.match(/^(.+?\b[\w’'-]+)\s+((?:that|who|which)\b[\s\S]+)$/i)
    if (relativeTurn && relativeTurn[1].split(/\s+/).length >= 3) {
      return { primary: relativeTurn[1].trim(), accent: relativeTurn[2].trim() }
    }

    // Recognizable conclusion/condition markers.
    const phraseTurn = trimmed.match(/^(.+?)\s+((?:no matter|even if|because|so that|rather than)\b[\s\S]+)$/i)
    if (phraseTurn && phraseTurn[1].split(/\s+/).length >= 2) {
      return { primary: phraseTurn[1].trim(), accent: phraseTurn[2].trim() }
    }

    // Copular/reflection frames have a clear semantic complement.
    const complementTurn = trimmed.match(
      /^(.+?\b(?:am|is|are|was|were|become|becomes|became|feel|feels|choose|chooses|deserve|deserves)\b)\s+(.+)$/i,
    )
    if (complementTurn) {
      return { primary: complementTurn[1].trim(), accent: complementTurn[2].trim() }
    }
  }

  const strongAt = findLastIndex(words, (w) => LANDING_HEAD.test(w))
  if (strongAt !== -1 && words.length - strongAt >= 2 && strongAt >= 2) {
    return {
      primary: words.slice(0, strongAt).join(' '),
      accent: words.slice(strongAt).join(' '),
    }
  }

  const softAt = findLastIndex(words, (w) => SOFT_LANDING.test(w))
  if (hangul && softAt !== -1 && softAt >= 2 && words.length - softAt >= 2) {
    const next = cleanWord(words[softAt + 1] ?? '')
    // Soft + relative: keep soft on primary (fits mobile card); accent from who/what…
    // Keep soft on primary — then primary may binary to “I attract” / “success through”
    if (RELATIVE_HEAD.test(next) && softAt + 1 < words.length - 1) {
      return {
        primary: words.slice(0, softAt + 1).join(' '),
        accent: words.slice(softAt + 1).join(' '),
      }
    }
    return {
      primary: words.slice(0, softAt).join(' '),
      accent: words.slice(softAt).join(' '),
    }
  }

  // Designer-safe fallback: arbitrary English should not receive an invented
  // emphasis. A single coherent voice is better than a wrong accent.
  if (!hangul) return { primary: trimmed, accent: '' }

  let accentCount = words.length >= 7 ? 3 : words.length >= 5 ? 2 : 1
  const last = words[words.length - 1] ?? ''
  if (TINY.test(cleanWord(last)) && accentCount < 2) accentCount = 2

  while (
    accentCount < Math.min(5, words.length - 1) &&
    DANGLING.test(cleanWord(words[words.length - accentCount - 1] ?? ''))
  ) {
    accentCount += 1
  }

  if (accentCount === 1 && words.length >= 5) accentCount = 2

  return {
    primary: words.slice(0, -accentCount).join(' '),
    accent: words.slice(-accentCount).join(' '),
  }
}

/**
 * LOCKED poster breaks — never re-open these via algorithm drift.
 * Mobile card measure is law: accent must not start with soft+relative
 * (“through who I am” overflows the card).
 */
const LOCKED_ALBUM_TYPO: Record<
  string,
  { primaryLines: string[]; accentLines: string[] }
> = {
  'i attract success through who i am becoming.': {
    primaryLines: ['I attract', 'success through'],
    accentLines: ['who I am', 'becoming.'],
  },
  'i attract success through who i am becoming': {
    primaryLines: ['I attract', 'success through'],
    accentLines: ['who I am', 'becoming.'],
  },
  // Keep phrase chunks intact — Success couplet poster break (card-safe lengths).
  "success doesn't arrive with applause. it arrives after countless quiet mornings.": {
    primaryLines: ["Success doesn't", 'arrive with', 'applause.'],
    accentLines: ['It arrives', 'after countless', 'quiet mornings.'],
  },
  "success doesn't arrive with applause. it arrives after countless quiet mornings": {
    primaryLines: ["Success doesn't", 'arrive with', 'applause.'],
    accentLines: ['It arrives', 'after countless', 'quiet mornings.'],
  },
  'success belongs to those who keep showing up after the excitement fades.': {
    primaryLines: ['Success belongs to', 'those who keep'],
    accentLines: ['showing up after', 'the excitement', 'fades.'],
  },
  'success belongs to those who keep showing up after the excitement fades': {
    primaryLines: ['Success belongs to', 'those who keep'],
    accentLines: ['showing up after', 'the excitement', 'fades.'],
  },
}

function normalizeAlbumKey(sentence: string) {
  return sentence.replace(/\u00A0/g, ' ').trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Editorial voice direction for the 40 curated English Lights.
 *
 * Instrument carries the thought; Rosemartin lands on the emotional turn,
 * contrast, or key noun phrase. This must be semantic—not a character-count
 * split—so weak fragments such as “in your future” or “to the doers” never
 * receive accidental emphasis.
 */
const CURATED_VOICE_SPLITS: Record<string, { primary: string; accent: string }> = {
  'stay hungry. stay foolish.': {
    primary: 'Stay hungry.',
    accent: 'Stay foolish.',
  },
  'your time is limited, so don’t waste it living someone else’s life.': {
    primary: 'Your time is limited, so don’t waste it',
    accent: 'living someone else’s life.',
  },
  'the people who are crazy enough to think they can change the world are the ones who do.': {
    primary: 'The people who are crazy enough to think they can change the world',
    accent: 'are the ones who do.',
  },
  'remembering that you’ll die is the best way i know to avoid the trap of thinking you have something to lose.': {
    primary: 'Remembering that you’ll die is the best way I know to avoid the trap of thinking you have',
    accent: 'something to lose.',
  },
  'don’t let the noise of others’ opinions drown out your own inner voice.': {
    primary: 'Don’t let the noise of others’ opinions drown out',
    accent: 'your own inner voice.',
  },
  'have the courage to follow your heart and intuition.': {
    primary: 'Have the courage to follow',
    accent: 'your heart and intuition.',
  },
  'we’re here to put a dent in the universe.': {
    primary: 'We’re here to put',
    accent: 'a dent in the universe.',
  },
  'it’s better to be a pirate than to join the navy.': {
    primary: 'It’s better to be a pirate',
    accent: 'than to join the navy.',
  },
  'the only way to do great work is to love what you do.': {
    primary: 'The only way to do great work is to',
    accent: 'love what you do.',
  },
  'you have to trust that the dots will somehow connect in your future.': {
    primary: 'You have to trust that the dots will',
    accent: 'somehow connect in your future.',
  },
  'you can’t connect the dots looking forward; you can only connect them looking backward.': {
    primary: 'You can’t connect the dots looking forward;',
    accent: 'you can only connect them looking backward.',
  },
  'getting fired was the best thing that could have ever happened to me.': {
    primary: 'Getting fired was the best thing that could have',
    accent: 'ever happened to me.',
  },
  'innovation distinguishes between a leader and a follower.': {
    primary: 'Innovation distinguishes between',
    accent: 'a leader and a follower.',
  },
  'design is not just what it looks like. design is how it works.': {
    primary: 'Design is not just what it looks like.',
    accent: 'Design is how it works.',
  },
  'sometimes when you innovate, you make mistakes. admit them quickly, and improve the next thing.': {
    primary: 'Sometimes when you innovate, you make mistakes.',
    accent: 'Admit them quickly, and improve the next thing.',
  },
  'being the richest person in the cemetery doesn’t matter to me.': {
    primary: 'Being the richest person in the cemetery',
    accent: 'doesn’t matter to me.',
  },
  'find what you love the way you’d find someone to love.': {
    primary: 'Find what you love the way you’d find',
    accent: 'someone to love.',
  },
  'your work will fill a large part of your life. do what you believe is great work.': {
    primary: 'Your work will fill a large part of your life.',
    accent: 'Do what you believe is great work.',
  },
  'if you haven’t found it yet, keep looking. don’t settle.': {
    primary: 'If you haven’t found it yet, keep looking.',
    accent: 'Don’t settle.',
  },
  'simple can be harder than complex.': {
    primary: 'Simple can be',
    accent: 'harder than complex.',
  },
  'when something is important enough, you do it even if the odds are against you.': {
    primary: 'When something is important enough, you do it',
    accent: 'even if the odds are against you.',
  },
  'failure is an option. if things aren’t failing, you aren’t innovating enough.': {
    primary: 'Failure is an option.',
    accent: 'If things aren’t failing, you aren’t innovating enough.',
  },
  'persistence is everything. don’t give up unless you’re forced to.': {
    primary: 'Persistence is everything.',
    accent: 'Don’t give up unless you’re forced to.',
  },
  'some people don’t like change, but you need to embrace it if the alternative is disaster.': {
    primary: 'Some people don’t like change,',
    accent: 'but you need to embrace it if the alternative is disaster.',
  },
  'ordinary people can choose to be extraordinary.': {
    primary: 'Ordinary people can choose to be',
    accent: 'extraordinary.',
  },
  'have almost too much self-belief.': {
    primary: 'Have almost too much',
    accent: 'self-belief.',
  },
  'the biggest risk is not taking any risk.': {
    primary: 'The biggest risk is',
    accent: 'not taking any risk.',
  },
  'history belongs to the doers.': {
    primary: 'History belongs to',
    accent: 'the doers.',
  },
  'have the courage to ask for what you want.': {
    primary: 'Have the courage to ask for',
    accent: 'what you want.',
  },
  'put all your eggs in one basket, and watch that basket.': {
    primary: 'Put all your eggs in one basket, and',
    accent: 'watch that basket.',
  },
  'the most precious asset we all have is time.': {
    primary: 'The most precious asset we all have is',
    accent: 'time.',
  },
  'life will give you great trials. don’t lose faith in yourself.': {
    primary: 'Life will give you great trials.',
    accent: 'Don’t lose faith in yourself.',
  },
  'what you’ll regret most is what you didn’t do.': {
    primary: 'What you’ll regret most',
    accent: 'is what you didn’t do.',
  },
  'stop looking back at yesterday. build tomorrow instead.': {
    primary: 'Stop looking back at yesterday.',
    accent: 'Build tomorrow instead.',
  },
  'people do their best work when they know the goal and why.': {
    primary: 'People do their best work',
    accent: 'when they know the goal and why.',
  },
  'keep a feedback loop. think about what you did, and how to do it better.': {
    primary: 'Keep a feedback loop.',
    accent: 'Think about what you did, and how to do it better.',
  },
  'focus. connect. believe in yourself.': {
    primary: 'Focus. Connect.',
    accent: 'Believe in yourself.',
  },
  'make it easy to take risks.': {
    primary: 'Make it easy to',
    accent: 'take risks.',
  },
  'find the intersection of what you’re good at, what you love, and what creates value.': {
    primary: 'Find the intersection of what you’re good at, what you love,',
    accent: 'and what creates value.',
  },
  'details matter. it’s worth waiting to get it right.': {
    primary: 'Details matter.',
    accent: 'It’s worth waiting to get it right.',
  },
}

/**
 * Safety net — if accent leaked a soft landing before a relative
 * (`through who…`), pull soft back onto primary. Mobile card overflow guard.
 */
function reclaimSoftBeforeRelative(
  primaryLines: string[],
  accentLines: string[],
): { primaryLines: string[]; accentLines: string[] } {
  if (accentLines.length === 0) return { primaryLines, accentLines }

  const firstWords = accentLines[0].split(/\s+/).filter(Boolean)
  if (firstWords.length < 2) return { primaryLines, accentLines }

  const soft = cleanWord(firstWords[0] ?? '')
  const next = cleanWord(firstWords[1] ?? '')
  if (!SOFT_LANDING.test(soft) || !RELATIVE_HEAD.test(next)) {
    return { primaryLines, accentLines }
  }

  const softToken = firstWords[0] ?? ''
  const restFirst = firstWords.slice(1).join(' ')
  const mergedAccent = [restFirst, ...accentLines.slice(1)].filter(Boolean)
  const mergedPrimary =
    primaryLines.length === 0
      ? [softToken]
      : [
          ...primaryLines.slice(0, -1),
          `${primaryLines[primaryLines.length - 1]} ${softToken}`.trim(),
        ]

  return {
    primaryLines: balancePhraseLines(
      mergedPrimary.join(' '),
      hasHangul(mergedPrimary.join(' ')) ? KR_LINE_BUDGET : LINE_BUDGET,
    ),
    accentLines: balancePhraseLines(
      mergedAccent.join(' '),
      hasHangul(mergedAccent.join(' ')) ? KR_ACCENT_LINE_BUDGET : ACCENT_LINE_BUDGET,
    ),
  }
}

/**
 * SINGLE SOURCE OF TRUTH for Light sentence line breaks.
 * Sky main + Light card (+ export) MUST render primaryLines / accentLines.
 */
export function getAlbumTypoLines(sentence: string): AlbumTypoLines {
  const key = normalizeAlbumKey(sentence)
  const locked = LOCKED_ALBUM_TYPO[key]
  if (locked) {
    return {
      primary: locked.primaryLines.join(' '),
      accent: locked.accentLines.join(' '),
      primaryLines: [...locked.primaryLines],
      accentLines: [...locked.accentLines],
    }
  }

  const voice = CURATED_VOICE_SPLITS[key] ?? splitVoice(sentence)
  const { primary, accent } = voice
  const hangul = hasHangul(sentence)
  const primaryBudget = hangul ? KR_LINE_BUDGET : LINE_BUDGET
  const accentBudget = hangul ? KR_ACCENT_LINE_BUDGET : ACCENT_LINE_BUDGET
  let primaryLines = balancePhraseLines(primary, primaryBudget)
  let accentLines = balancePhraseLines(accent, accentBudget)

  ;({ primaryLines, accentLines } = reclaimSoftBeforeRelative(primaryLines, accentLines))

  return {
    primary: primaryLines.join(' '),
    accent: accentLines.join(' '),
    primaryLines,
    accentLines,
  }
}

/** Fixtures for regression — keep in sync with LOCKED_ALBUM_TYPO. */
export const ALBUM_TYPO_REGRESSION = [
  {
    sentence: 'I attract success through who I am becoming.',
    primaryLines: ['I attract', 'success through'],
    accentLines: ['who I am', 'becoming.'],
  },
  {
    sentence: "Success doesn't arrive with applause. It arrives after countless quiet mornings.",
    primaryLines: ["Success doesn't", 'arrive with', 'applause.'],
    accentLines: ['It arrives', 'after countless', 'quiet mornings.'],
  },
  {
    sentence: 'Success belongs to those who keep showing up after the excitement fades.',
    primaryLines: ['Success belongs to', 'those who keep'],
    accentLines: ['showing up after', 'the excitement', 'fades.'],
  },
] as const

/**
 * Sentence gate + Today's Star pool smoke check.
 * Run: node scripts/check-sentence-gate.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Inline mirror of distill-reflection (no TS loader in plain node).
const hasHangul = (t) => /[\uAC00-\uD7A3]/.test(t)
const FILLER_ONLY = /^(uh+|um+|hmm+|ah+|er+|\.+|…+)+$/i
const FILLER_WORD = /^(uh|um|hmm|ah|er|like|so|well|okay|ok|yes|no|ㅎ|ㅋ|ㅠ|ㅜ)$/i
function normalizeLightSentence(raw) {
  return raw.trim().replace(/\s+/g, ' ')
}
function hasMeaningfulContent(raw) {
  const text = normalizeLightSentence(raw)
  if (!text) return false
  const bare = text.replace(/[.!?。…]+$/g, '').trim()
  if (!bare) return false
  const lower = bare.toLowerCase()
  if (FILLER_ONLY.test(lower) || FILLER_WORD.test(lower)) return false
  if (/[.!?。…]$/.test(text) && bare.length >= 2) {
    if (hasHangul(bare)) return [...bare.replace(/\s/g, '')].length >= 2
    return bare.split(' ').filter(Boolean).length >= 2 || bare.length >= 8
  }
  if (hasHangul(text)) {
    const syllables = [...bare.replace(/\s/g, '')].length
    const words = bare.split(' ').filter(Boolean).length
    return syllables >= 4 || words >= 2
  }
  const words = bare.split(' ').filter(Boolean)
  if (words.length >= 3) return true
  if (words.length === 2 && words.every((w) => w.replace(/[^a-z0-9']/gi, '').length >= 2)) {
    return true
  }
  return false
}

function extract(path, name) {
  const s = readFileSync(join(root, path), 'utf8')
  const m = s.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`))
  assert.ok(m, `missing ${name}`)
  return [...m[1].matchAll(/'((?:\\\\'|[^'])*)'/g)].map((x) => x[1].replace(/\\'/g, "'"))
}

const en = extract('components/vora/light-quotes.ts', 'LIGHTS')
const ko = extract('components/vora/light-quotes-ko.ts', 'LIGHTS_KO')
assert.equal(en.length, 40)
assert.equal(ko.length, 40)
for (const s of en) assert.ok(hasMeaningfulContent(s), `EN blocked: ${s}`)
for (const s of ko) assert.ok(hasMeaningfulContent(s), `KO blocked: ${s}`)

const edges = [
  ['', false],
  ['ok', false],
  ['Enough', false],
  ['I am', false],
  ['I am.', true],
  ['I am enough', true],
  ['Be kind', true],
  ['Stay hungry. Stay foolish.', true],
  ['I am enough. Be kind.', true],
  ['별', false],
  ['안녕', false],
  ['사랑해', false],
  ['사랑해요', true],
  ['감사합니다', true],
  ['나는 충분하다. 그리고 간다.', true],
  ['I  am   enough', true],
  ['ㅎ', false],
]
for (const [t, want] of edges) {
  assert.equal(hasMeaningfulContent(t), want, `edge ${JSON.stringify(t)}`)
}

assert.equal(normalizeLightSentence('  I  am  '), 'I am')

const locale = readFileSync(join(root, 'components/vora/locale.ts'), 'utf8')
assert.ok(locale.includes('writeSentenceHint'))
assert.ok(locale.includes('writeDuplicateHint'))
assert.ok(locale.includes('적어도 한 문장이면 별이 됩니다.'))
assert.ok(locale.includes('Already in your sky today.'))

const panel = readFileSync(join(root, 'components/vora/sky-todays-light-panel.tsx'), 'utf8')
assert.ok(panel.includes('showSentenceHint'))
assert.ok(panel.includes('showDuplicateHint'))
assert.ok(panel.includes('disabled={!canHoldDiary || ascending}'))

const sky = readFileSync(join(root, 'components/vora/screens/sky-screen.tsx'), 'utf8')
assert.ok(sky.includes("source === 'diary' && !hasMeaningfulContent"))

console.log('sentence gate OK — pool + edges + UI wiring')

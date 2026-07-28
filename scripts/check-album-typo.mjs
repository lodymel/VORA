/**
 * Regression: Sky + Card typography goldens + center-safe CSS + live splits.
 * Run: node scripts/check-album-typo.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const typoPath = join(root, 'components/vora/mirror-album-typo.ts')
const source = readFileSync(typoPath, 'utf8')
const css = readFileSync(join(root, 'app/globals.css'), 'utf8')
const moduleCss = readFileSync(
  join(root, 'components/vora/album-typo-block.module.css'),
  'utf8',
)
const blockTsx = readFileSync(join(root, 'components/vora/album-typo-block.tsx'), 'utf8')
const lightsSource = readFileSync(join(root, 'components/vora/light-quotes.ts'), 'utf8')
const localeProvider = readFileSync(join(root, 'components/vora/vora-locale.tsx'), 'utf8')
const todayPanel = readFileSync(join(root, 'components/vora/sky-todays-light-panel.tsx'), 'utf8')
const enterScreen = readFileSync(
  join(root, 'components/vora/screens/enter-ritual-screen.tsx'),
  'utf8',
)

const MUST_CONTAIN = [
  "primaryLines: ['I attract', 'success through']",
  "accentLines: ['who I am', 'becoming.']",
  'reclaimSoftBeforeRelative',
  'LOCKED_ALBUM_TYPO',
  'Keep soft on primary',
  '!SOFT_LANDING.test(w)',
  'Never force a couplet',
  'CURATED_VOICE_SPLITS',
  'This must be semantic',
]

for (const needle of MUST_CONTAIN) {
  assert.ok(source.includes(needle), `mirror-album-typo.ts missing: ${needle}`)
}

const FORBIDDEN = [
  "primaryLines: ['I attract success through']",
  "accentLines: ['through who I am', 'becoming.']",
]
for (const bad of FORBIDDEN) {
  assert.ok(!source.includes(bad), `Forbidden typography regression: ${bad}`)
}

const albumStart = css.indexOf('\n.vora-album-typo-line {')
assert.ok(albumStart !== -1, 'album typo CSS block missing')
const albumBlock = css.slice(albumStart, albumStart + 2500)

assert.ok(
  css.includes('padding-inline-end: var(--vora-typo-hero-track-fix)'),
  'album lines must apply letter-spacing track-fix',
)
assert.ok(albumBlock.includes('left: auto'), 'album lines must reset left:auto')
assert.ok(albumBlock.includes('transform: none'), 'album lines must reset transform:none')
assert.ok(!/\bleft:\s*50%/.test(albumBlock), 'album lines must NEVER use left:50%')
assert.ok(!albumBlock.includes('translateX(-50%'), 'album lines must NEVER use translateX(-50%)')
assert.ok(!albumBlock.includes('translateX(calc(-50%'), 'album lines must NEVER mix -50% into transform')
assert.ok(albumBlock.includes('max-width: none'), 'album lines must not clip with max-width:100%')
assert.ok(albumBlock.includes('max-content'), 'album lines must size to content')
assert.ok(css.includes('.vora-lang-ko'), 'Korean typography scope missing')
assert.ok(css.includes('html.vora-locale-ko'), 'Korean UI locale scope missing')
assert.ok(css.includes('--font-ko-hero'), 'Korean hero font token missing')
assert.ok(localeProvider.includes("root.classList.toggle('vora-locale-ko'"))
assert.ok(!localeProvider.includes("root.classList.toggle('vora-lang-ko'"))
assert.ok(
  !todayPanel.includes("locale === 'ko' || writingHangul"),
  'UI locale must not force English Lights into Korean content fonts',
)

assert.ok(moduleCss.includes('max-width: none'), 'module must force max-width:none')
assert.ok(moduleCss.includes('display: flex'), 'module must flex-center rows')
assert.ok(blockTsx.includes('album-typo-block.module.css'), 'AlbumTypoBlock must import layout module')
assert.ok(blockTsx.includes('vora-lang-ko'), 'AlbumTypoBlock must mark Hangul scope')

const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: 'mirror-album-typo.ts',
})
const scriptPath = join(root, 'components/vora/text-script.ts')
const { outputText: scriptOut } = ts.transpileModule(readFileSync(scriptPath, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: 'text-script.ts',
})
const scriptTmp = join(root, 'scripts/text-script.mjs')
const tmp = join(root, 'scripts/.album-typo.tmp.mjs')
writeFileSync(scriptTmp, scriptOut)
writeFileSync(
  tmp,
  outputText.replaceAll("from './text-script'", "from './text-script.mjs'"),
)
const { getAlbumTypoLines } = await import(`${pathToFileURL(tmp).href}?t=${Date.now()}`)
unlinkSync(tmp)
unlinkSync(scriptTmp)

function expectLines(sentence, primaryLines, accentLines) {
  const got = getAlbumTypoLines(sentence)
  assert.deepEqual(
    { primaryLines: got.primaryLines, accentLines: got.accentLines },
    { primaryLines, accentLines },
    `bad break for: ${sentence}`,
  )
}

const curatedLights = [
  ...lightsSource.matchAll(/^  '((?:\\\\'|[^'])*)',?$/gm),
].map((match) => match[1].replace(/\\'/g, "'"))
assert.equal(curatedLights.length, 40, 'all curated English Lights must be audited')
for (const sentence of curatedLights) {
  const got = getAlbumTypoLines(sentence)
  assert.equal(
    [got.primary, got.accent].filter(Boolean).join(' '),
    sentence,
    `semantic split changed copy: ${sentence}`,
  )
  assert.ok(got.primary.length > 0, `missing primary voice: ${sentence}`)
  assert.ok(got.accent.length > 0, `missing semantic landing: ${sentence}`)
}

function expectVoices(sentence, primary, accent) {
  const got = getAlbumTypoLines(sentence)
  assert.equal(got.primary, primary, `bad primary voice for: ${sentence}`)
  assert.equal(got.accent, accent, `bad accent voice for: ${sentence}`)
}

// Semantic emphasis—not accidental grammar fragments.
expectVoices(
  'Have the courage to follow your heart and intuition.',
  'Have the courage to follow',
  'your heart and intuition.',
)
expectVoices(
  'You have to trust that the dots will somehow connect in your future.',
  'You have to trust that the dots will',
  'somehow connect in your future.',
)
expectVoices('History belongs to the doers.', 'History belongs to', 'the doers.')
expectVoices(
  'The most precious asset we all have is time.',
  'The most precious asset we all have is',
  'time.',
)
expectVoices('Focus. Connect. Believe in yourself.', 'Focus. Connect.', 'Believe in yourself.')

// New user writing: only split when the semantic turn is high-confidence.
expectVoices('I am enough.', 'I am', 'enough.')
expectVoices('I choose thoughts that lift me higher.', 'I choose thoughts', 'that lift me higher.')
expectVoices('I can do it no matter what.', 'I can do it', 'no matter what.')
expectVoices(
  'A quiet morning changes everything slowly.',
  'A quiet morning changes everything slowly.',
  '',
)
expectVoices('Soft rain on the window', 'Soft rain on the window', '')

// Short idiomatic setup stays one line — not a forced couplet
expectLines('I can do it no matter what.', ['I can do it'], ['no matter what.'])
expectLines('I can do it no matter what', ['I can do it'], ['no matter what'])

// Locked attract poster
expectLines('I attract success through who I am becoming.', ['I attract', 'success through'], [
  'who I am',
  'becoming.',
])

// Success couplet — card-safe poster breaks
expectLines(
  "Success doesn't arrive with applause. It arrives after countless quiet mornings.",
  ["Success doesn't", 'arrive with', 'applause.'],
  ['It arrives', 'after countless', 'quiet mornings.'],
)

expectLines(
  'Success belongs to those who keep showing up after the excitement fades.',
  ['Success belongs to', 'those who keep'],
  ['showing up after', 'the excitement', 'fades.'],
)

// Long soft bridge still binary-splits (over primary budget)
expectLines('I attract success through who I am becoming', ['I attract', 'success through'], [
  'who I am',
  'becoming.',
])

// Other short user-like sentences — primary stays readable, no forced couplets on short fits
{
  const a = getAlbumTypoLines('I choose thoughts that lift me higher.')
  assert.deepEqual(a.primaryLines, ['I choose thoughts'])
  assert.deepEqual(a.accentLines, ['that lift', 'me higher.'])
}

{
  const b = getAlbumTypoLines('I choose myself, again and again.')
  assert.deepEqual(b.primaryLines, ['I choose myself,'])
  assert.ok(b.accentLines.join(' ').toLowerCase().includes('again'))
}

{
  const ko = getAlbumTypoLines('나는 충분하다. 있는 그대로.')
  assert.ok(ko.primaryLines.length >= 1)
  assert.ok(ko.primaryLines.every((line) => line.length > 0))
  for (const line of [...ko.primaryLines, ...ko.accentLines]) {
    assert.ok(line.length <= 14, `Korean line too long: ${line}`)
  }
}

assert.ok(
  css.includes(
    '.vora-sky-page--writing:not(.vora-sky-page--holding) .vora-sky-ritual--editorial',
  ) && css.includes('padding-top: calc(var(--vora-header-total) + 0.5rem)'),
  'writing composer must reserve the full header clearance',
)
assert.ok(
  css.includes('.vora-sky-page--writing .vora-sky-write-hint--sentence') &&
    css.includes('white-space: nowrap'),
  'writing hint must not orphan the final word',
)
assert.ok(
  /\.vora-sky-page--writing \.vora-whisper-chip\s*\{[^}]*min-height:\s*2\.8125rem/s.test(css),
  'writing Hold button must keep a 44px touch target',
)
assert.ok(
  todayPanel.indexOf('className="vora-sky-write-guidance"') <
    todayPanel.indexOf('onClick={handleHoldDiary}'),
  'writing guidance must be read before the primary Hold action',
)
assert.ok(
  enterScreen.indexOf('className="vora-enter-sound-hint"') <
    enterScreen.indexOf('className="vora-enter-cta-row"'),
  'entry context must precede the primary Enter action',
)
assert.ok(
  /\.vora-light-card-action\s*\{[^}]*min-height:\s*2\.8125rem/s.test(css),
  'card actions must keep a 44px touch target',
)
assert.ok(
  /\.vora-sky-write-guidance\s*\{[^}]*margin-bottom:\s*0\.35rem/s.test(css),
  'writing guidance needs clear breathing room above Hold',
)

console.log('album typo lock OK — center-safe CSS + live splits + balanced attract')

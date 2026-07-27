/**
 * Case matrix for Sky hero Hold / Release / day rollover.
 * Run: node scripts/check-sky-hero.mjs
 */
import assert from 'node:assert/strict'

function isSeedLight(light) {
  const id = String(light.id)
  return id.startsWith('vora-seed-') || id.startsWith('seed-')
}

function formatToday() {
  return 'Today'
}

function formatLightDateLabel(daysAgo, now) {
  const d = new Date(now)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - daysAgo)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)
}

function ageUserLights(lights, now = new Date()) {
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return lights.map((light) => {
    if (isSeedLight(light)) return light
    const ts = Number(light.id)
    if (!Number.isFinite(ts) || ts < 1e12) return light
    const saved = new Date(ts)
    if (Number.isNaN(saved.getTime())) return light
    const savedUtc = Date.UTC(saved.getFullYear(), saved.getMonth(), saved.getDate())
    const daysAgo = Math.max(0, Math.floor((todayUtc - savedUtc) / 86_400_000))
    return {
      ...light,
      daysAgo,
      date: daysAgo === 0 ? formatToday() : formatLightDateLabel(daysAgo, now),
    }
  })
}

function getLatestTodayUserLight(lights) {
  return lights.find((light) => light.daysAgo === 0 && !isSeedLight(light)) ?? null
}

function getSkyHeroSentence(lights, dailyPrompt) {
  return getLatestTodayUserLight(lights)?.sentence ?? dailyPrompt
}

function getSkyHeroHeldLight(lights, dailyPrompt) {
  const latest = getLatestTodayUserLight(lights)
  if (latest) return latest
  const prompt = dailyPrompt.trim()
  if (!prompt) return null
  return (
    lights.find(
      (light) =>
        light.daysAgo === 0 &&
        !isSeedLight(light) &&
        light.sentence.trim() === prompt,
    ) ?? null
  )
}

function shouldRestHeroAfterRelease(lights, releasedId) {
  const released = lights.find((light) => light.id === releasedId)
  if (!released || isSeedLight(released) || released.daysAgo !== 0) return false
  return !lights.some(
    (light) =>
      light.id !== releasedId &&
      light.daysAgo === 0 &&
      !isSeedLight(light),
  )
}

function removeLight(lights, id) {
  return lights.filter((light) => light.id !== id)
}

const PROMPT = 'Daily invitation prompt.'
const now = new Date('2026-07-26T15:00:00')
const todayTs = new Date('2026-07-26T10:00:00').getTime()
const yesterdayTs = new Date('2026-07-25T10:00:00').getTime()

let pass = 0
function check(name, fn) {
  fn()
  pass += 1
  console.log(`PASS ${pass}: ${name}`)
}

check('empty sky → daily prompt, not held', () => {
  const lights = ageUserLights([], now)
  assert.equal(getSkyHeroSentence(lights, PROMPT), PROMPT)
  assert.equal(getSkyHeroHeldLight(lights, PROMPT), null)
})

check('hold custom → hero shows custom + held', () => {
  const lights = ageUserLights(
    [{ id: String(todayTs), sentence: 'My own Light.', date: 'Today', daysAgo: 0 }],
    now,
  )
  assert.equal(getSkyHeroSentence(lights, PROMPT), 'My own Light.')
  assert.equal(getSkyHeroHeldLight(lights, PROMPT)?.sentence, 'My own Light.')
})

check('hold custom then release → hero returns to prompt', () => {
  const held = { id: String(todayTs), sentence: 'My own Light.', date: 'Today', daysAgo: 0 }
  const after = ageUserLights(removeLight([held], held.id), now)
  assert.equal(getSkyHeroSentence(after, PROMPT), PROMPT)
  assert.equal(getSkyHeroHeldLight(after, PROMPT), null)
})

check('two today lights → newest wins; release newest → older remains', () => {
  const older = { id: String(todayTs - 1000), sentence: 'First hold.', date: 'Today', daysAgo: 0 }
  const newer = { id: String(todayTs), sentence: 'Second hold.', date: 'Today', daysAgo: 0 }
  // newest-first array (addLightIfNew prepends)
  let lights = ageUserLights([newer, older], now)
  assert.equal(getSkyHeroSentence(lights, PROMPT), 'Second hold.')
  lights = ageUserLights(removeLight(lights, newer.id), now)
  assert.equal(getSkyHeroSentence(lights, PROMPT), 'First hold.')
  lights = ageUserLights(removeLight(lights, older.id), now)
  assert.equal(getSkyHeroSentence(lights, PROMPT), PROMPT)
})

check('hold daily prompt → hero held; release → rest (not same line + Hold)', () => {
  const held = { id: String(todayTs), sentence: PROMPT, date: 'Today', daysAgo: 0 }
  let lights = ageUserLights([held], now)
  assert.equal(getSkyHeroSentence(lights, PROMPT), PROMPT)
  assert.ok(getSkyHeroHeldLight(lights, PROMPT))
  assert.equal(shouldRestHeroAfterRelease(lights, held.id), true)
  lights = ageUserLights(removeLight(lights, held.id), now)
  assert.equal(getSkyHeroHeldLight(lights, PROMPT), null)
  assert.equal(getSkyHeroSentence(lights, PROMPT), PROMPT)
})

check('release custom light → also rest (no same-day loop)', () => {
  const held = { id: String(todayTs), sentence: 'My own Light.', date: 'Today', daysAgo: 0 }
  const lights = ageUserLights([held], now)
  assert.equal(shouldRestHeroAfterRelease(lights, held.id), true)
})

check('release newest of two today lights → do not rest; older stays held', () => {
  const older = { id: String(todayTs - 1000), sentence: PROMPT, date: 'Today', daysAgo: 0 }
  const newer = { id: String(todayTs), sentence: 'Second.', date: 'Today', daysAgo: 0 }
  const lights = ageUserLights([newer, older], now)
  assert.equal(shouldRestHeroAfterRelease(lights, newer.id), false)
  assert.equal(shouldRestHeroAfterRelease(lights, older.id), false)
})

check('yesterday light ages out of hero “today”', () => {
  const lights = ageUserLights(
    [{ id: String(yesterdayTs), sentence: 'Yesterday Light.', date: 'Jul 25', daysAgo: 0 }],
    now,
  )
  assert.equal(lights[0].daysAgo, 1)
  assert.equal(getSkyHeroSentence(lights, PROMPT), PROMPT)
  assert.equal(getSkyHeroHeldLight(lights, PROMPT), null)
})

check('seeds never become hero held lights', () => {
  const lights = ageUserLights(
    [
      {
        id: 'vora-seed-r6-0-d7',
        sentence: 'Seed sentence.',
        date: 'Jul 19',
        daysAgo: 7,
      },
    ],
    now,
  )
  assert.equal(getSkyHeroSentence(lights, PROMPT), PROMPT)
  assert.equal(getSkyHeroHeldLight(lights, PROMPT), null)
})

check('Release CTA priority: held target exists even with whisper flag scenario', () => {
  const held = { id: String(todayTs), sentence: 'Held.', date: 'Today', daysAgo: 0 }
  const releaseTarget = getSkyHeroHeldLight([held], PROMPT)
  const skyBeganWhisper = true
  const cta =
    releaseTarget != null ? 'release' : skyBeganWhisper ? 'whisper' : 'hold'
  assert.equal(cta, 'release')
})

console.log(`\nAll ${pass} sky-hero checks passed.`)

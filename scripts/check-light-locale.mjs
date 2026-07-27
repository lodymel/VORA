/**
 * Smoke-check Korean Light pools (single pool, no categories).
 * Run: node scripts/check-light-locale.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const ko = readFileSync(join(root, 'components/vora/light-quotes-ko.ts'), 'utf8')
const en = readFileSync(join(root, 'components/vora/light-quotes.ts'), 'utf8')
const constants = readFileSync(join(root, 'components/vora/constants.ts'), 'utf8')
const locale = readFileSync(join(root, 'components/vora/locale.ts'), 'utf8')
const typo = readFileSync(join(root, 'components/vora/mirror-album-typo.ts'), 'utf8')

assert.ok(ko.includes('export const LIGHTS_KO'), 'missing LIGHTS_KO')
assert.ok(en.includes('export const LIGHTS'), 'missing LIGHTS')
assert.ok(!ko.includes('SUCCESS_LIGHTS_KO'), 'category KO pools should be gone')
assert.ok(!ko.includes('FUN_LIGHTS_KO'), 'FUN pool should stay removed')
assert.ok(!constants.includes('LightCategoryId'), 'LightCategoryId should be removed')
assert.ok(!constants.includes('categoryLightsFor'), 'categoryLightsFor should be removed')
assert.ok(!constants.includes('dailyLightsFor'), 'dailyLightsFor should be removed')
assert.ok(constants.includes('lightsFor'))
assert.ok(constants.includes("locale === 'ko'"))
assert.ok(constants.includes('SKY_SEED_REVISION = 13'))
assert.ok(constants.includes('vora-seed-r${SKY_SEED_REVISION}-${lang}'))

const hangulLines = (ko.match(/'[^']*[\uAC00-\uD7A3][^']*'/g) || []).length
assert.ok(hangulLines >= 40, `expected ≥40 KO lines, got ${hangulLines}`)

const enLines = (en.match(/^\s+'[^']+',?\s*$/gm) || []).length
assert.ok(enLines >= 40, `expected ≥40 EN lines, got ${enLines}`)
const enCopy = en.match(/'[^'\n]*'/g) || []
const localeCopy = locale.match(/:\s*'[^'\n]*'/g) || []
assert.ok(!enCopy.some((line) => line.includes('—')), 'curated English Lights must not use em dashes')
assert.ok(!localeCopy.some((line) => line.includes('—')), 'app locale copy must not use em dashes')
assert.ok(
  !typo.match(/^\s*['"][^'"]*—[^'"]*['"][:;,]?\s*$/gm),
  'curated typography strings must not use em dashes',
)

console.log('light locale OK — single pool, no categories')

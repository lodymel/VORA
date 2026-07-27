import { LIGHTS } from './light-quotes'
import { LIGHTS_KO } from './light-quotes-ko'
import type { VoraLocale } from './locale'
import { hasHangul } from './text-script'

export type Light = {
  id: string
  sentence: string
  date: string
  /** Days since the light was saved — used for constellation sizing */
  daysAgo: number
}

export type SparkPrompt = {
  title: string
  subtitle?: string
}

/** @deprecated Prefer LightReminder — kept for one-shot migrate from localStorage */
export type { NotificationPreference } from './light-reminder'
export type { LightReminder } from './light-reminder'

/** Today's Star pool for the current language. */
export function lightsFor(locale: VoraLocale = 'en'): readonly string[] {
  return locale === 'ko' ? LIGHTS_KO : LIGHTS
}

/** @deprecated Prefer lightsFor(locale) */
export const DAILY_LIGHTS: readonly string[] = [...LIGHTS]

/** Local calendar day index — matches “held today” aging (not UTC). */
export function localDayIndex(now = new Date()): number {
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000)
}

export function localDayKey(now = new Date()): string {
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
}

/** Today's Star — one quiet invitation sentence for this local day. */
export function getTodaysLight(locale: VoraLocale = 'en', now = new Date()): string {
  const pool = lightsFor(locale)
  return pool[localDayIndex(now) % pool.length]
}

export const SPARK_PROMPTS: SparkPrompt[] = [
  { title: 'What do you love about yourself?', subtitle: 'Write with love. Only for you.' },
  { title: 'What are you proud of today?', subtitle: 'Celebrate yourself. Only for you.' },
  { title: 'What success are you moving toward?', subtitle: 'Claim it. Only for you.' },
  { title: 'What makes you feel confident?', subtitle: 'Own your light. Only for you.' },
  { title: 'What do you choose for yourself?', subtitle: 'Write with love. Only for you.' },
]

/** Bump when default Sky seed shape / language pools change. */
export const SKY_SEED_REVISION = 13

/**
 * Seven Today's Star lines for the default constellation.
 * Dates are all before today so the sky already feels lived-in.
 */
function seedFromPool(locale: VoraLocale) {
  const pool = lightsFor(locale)
  const picks = [0, 2, 6, 8, 20, 26, 30]
  return picks.map((index, i) => ({
    sentence: pool[index % pool.length],
    daysAgo: 7 - i,
  }))
}

function formatLightDateLabel(daysAgo: number, now: Date, locale: VoraLocale = 'en'): string {
  const d = new Date(now)
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - daysAgo)
  const tag = locale === 'ko' ? 'ko-KR' : 'en-US'
  return new Intl.DateTimeFormat(tag, { month: 'short', day: 'numeric' }).format(d)
}

/** Default Sky — 7 Lights dated across recent days. */
export function createSeedLights(now = new Date(), locale: VoraLocale = 'en'): Light[] {
  const lang = locale === 'ko' ? 'ko' : 'en'
  return seedFromPool(locale).map(({ sentence, daysAgo }, index) => ({
    id: `vora-seed-r${SKY_SEED_REVISION}-${lang}-${index}-d${daysAgo}`,
    sentence,
    date: formatLightDateLabel(daysAgo, now, locale),
    daysAgo,
  }))
}

export function isSeedLight(light: Light): boolean {
  const id = String(light.id)
  return id.startsWith('vora-seed-') || id.startsWith('seed-')
}

/**
 * Personal Light ids are timestamps — refresh daysAgo so “today” rolls over at midnight.
 * Seeds keep their authored offsets (rebuilt in resolveSkyLights).
 */
export function ageUserLights(
  lights: Light[],
  now = new Date(),
  locale: VoraLocale = 'en',
): Light[] {
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
      date: daysAgo === 0 ? formatToday(locale) : formatLightDateLabel(daysAgo, now, locale),
    }
  })
}

/**
 * Keep personal Lights (Latin or Hangul).
 * Sparse skies (< 7 own Lights) always keep the starter constellation —
 * one Hold must never erase the default seven.
 */
export function resolveSkyLights(
  lights: Light[] | null | undefined,
  options?: { locale?: VoraLocale },
): Light[] {
  const locale = options?.locale ?? 'en'
  const cleaned = ageUserLights(dedupeLights(lights), new Date(), locale)
  const userLights = cleaned.filter((light) => !isSeedLight(light))

  if (userLights.length >= 7) return userLights

  const seeds = createSeedLights(new Date(), locale)
  if (userLights.length === 0) return seeds

  const taken = new Set(userLights.map((light) => light.sentence.trim().toLowerCase()))
  const filler = seeds.filter((seed) => !taken.has(seed.sentence.trim().toLowerCase()))
  return dedupeLights([...userLights, ...filler])
}

/** True when the sky has no Lights yet (needs the default constellation). */
export function needsSeedLights(lights: Light[] | null | undefined): boolean {
  return !Array.isArray(lights) || lights.length === 0
}

export function formatToday(locale: VoraLocale = 'en'): string {
  return locale === 'ko' ? '오늘' : 'Today'
}

/** Remove duplicate saves — same sentence on the same day keeps the newest only. */
export function dedupeLights(lights: Light[] | null | undefined): Light[] {
  if (!Array.isArray(lights)) return []
  const seen = new Set<string>()
  return lights.filter((light) => {
    if (!light || typeof light.sentence !== 'string') return false
    const key = `${light.daysAgo}:${light.sentence.trim()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function hasLightToday(lights: Light[], sentence: string): boolean {
  const normalized = sentence.trim().replace(/\s+/g, ' ').toLowerCase()
  return lights.some(
    (l) => l.daysAgo === 0 && l.sentence.trim().replace(/\s+/g, ' ').toLowerCase() === normalized,
  )
}

/** Newest personal Light held today (seeds never count). Array is newest-first. */
export function getLatestTodayUserLight(lights: Light[]): Light | null {
  return lights.find((light) => light.daysAgo === 0 && !isSeedLight(light)) ?? null
}

/**
 * What the Sky body should show:
 * 1) the Light you just held today
 * 2) else Today's Star
 */
export function getSkyHeroSentence(lights: Light[], dailyPrompt: string): string {
  return getLatestTodayUserLight(lights)?.sentence ?? dailyPrompt
}

/** The held Light currently on the hero — Release removes this one. */
export function getSkyHeroHeldLight(lights: Light[], dailyPrompt: string): Light | null {
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

/**
 * After Release of the last today Light, rest the hero —
 * never snap back to the same daily line (or Today's Star loop).
 */
export function shouldRestHeroAfterRelease(
  lights: Light[],
  releasedId: string,
): boolean {
  const released = lights.find((light) => light.id === releasedId)
  if (!released || isSeedLight(released) || released.daysAgo !== 0) return false
  return !lights.some(
    (light) =>
      light.id !== releasedId &&
      light.daysAgo === 0 &&
      !isSeedLight(light),
  )
}

export function addLightIfNew(
  lights: Light[],
  sentence: string,
  options?: { allowHangul?: boolean; locale?: VoraLocale },
): Light[] | null {
  const normalized = sentence.trim().replace(/\s+/g, ' ')
  if (!normalized) return null
  if (hasHangul(normalized) && !options?.allowHangul) return null
  if (hasLightToday(lights, normalized)) return null
  const locale = options?.locale ?? 'en'
  return [
    { id: `${Date.now()}`, sentence: normalized, date: formatToday(locale), daysAgo: 0 },
    ...lights,
  ]
}

export function removeLight(lights: Light[], id: string): Light[] {
  return lights.filter((light) => light.id !== id)
}

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

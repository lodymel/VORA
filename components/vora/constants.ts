import { DREAM_LIGHTS } from './light-quotes-dream'
import { FUN_LIGHTS } from './light-quotes-fun'
import { HEALTH_LIGHTS } from './light-quotes-health'
import { LOVE_LIGHTS } from './light-quotes-love'
import { SUCCESS_LIGHTS } from './light-quotes-success'

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

/**
 * Curated daily Lights — Success + Love + Dream + Fun + Health.
 */
export const DAILY_LIGHTS: readonly string[] = [
  ...SUCCESS_LIGHTS,
  ...LOVE_LIGHTS,
  ...DREAM_LIGHTS,
  ...FUN_LIGHTS,
  ...HEALTH_LIGHTS,
]

export type LightCategoryId = 'success' | 'love' | 'dream' | 'fun' | 'health'

/** Per-category pools — tap a mood, receive one of these. */
export const CATEGORY_LIGHTS: Record<LightCategoryId, readonly string[]> = {
  success: SUCCESS_LIGHTS,
  love: LOVE_LIGHTS,
  dream: DREAM_LIGHTS,
  fun: FUN_LIGHTS,
  health: HEALTH_LIGHTS,
}

/** One Light from a category — avoids repeating the current sentence when possible. */
export function pickCategoryLight(
  category: LightCategoryId,
  avoid: string | null = null,
): string {
  const pool = CATEGORY_LIGHTS[category]
  if (pool.length === 0) return ''
  if (pool.length === 1) return pool[0]
  const normalized = avoid?.trim() ?? ''
  let next = pool[Math.floor(Math.random() * pool.length)]
  if (normalized) {
    for (let i = 0; i < 8 && next === normalized; i++) {
      next = pool[Math.floor(Math.random() * pool.length)]
    }
  }
  return next
}

export function getTodaysLight(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  return DAILY_LIGHTS[dayIndex % DAILY_LIGHTS.length]
}

export const SPARK_PROMPTS: SparkPrompt[] = [
  { title: 'What do you love about yourself?', subtitle: 'Write with love. Only for you.' },
  { title: 'What are you proud of today?', subtitle: 'Celebrate yourself. Only for you.' },
  { title: 'What success are you moving toward?', subtitle: 'Claim it. Only for you.' },
  { title: 'What makes you feel confident?', subtitle: 'Own your light. Only for you.' },
  { title: 'What do you choose for yourself?', subtitle: 'Write with love. Only for you.' },
]

/** First-sky Lights — seven past days so a new Sky already feels alive. */
const SEED_SENTENCES = [
  'Every step forward counts, even when it feels too small to matter.',
  'Love grows strongest where honesty feels safe.',
  'Keep following what makes your heart feel awake.',
  'You\'re allowed to laugh before everything is figured out.',
  'Your body has never asked for perfection. Only a little kindness.',
  'Quiet determination will always outlast loud ambition.',
  'Some dreams wait patiently because they know exactly who you\'re becoming.',
] as const

/** Build seven Lights dated before today (daysAgo 7 → 1). Never includes today. */
export function createSeedLights(now = new Date()): Light[] {
  return SEED_SENTENCES.map((sentence, index) => {
    // Oldest → newest among past days: 7, 6, 5, 4, 3, 2, 1 (today = 0 excluded).
    const daysAgo = SEED_SENTENCES.length - index
    const d = new Date(now)
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - daysAgo)
    return {
      id: `vora-seed-${daysAgo}`,
      sentence,
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d),
      daysAgo,
    }
  })
}

/** True when the sky has no Lights yet (needs the default constellation). */
export function needsSeedLights(lights: Light[] | null | undefined): boolean {
  return !Array.isArray(lights) || lights.length === 0
}

export function formatToday(): string {
  return 'Today'
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
  const normalized = sentence.trim()
  return lights.some((l) => l.daysAgo === 0 && l.sentence.trim() === normalized)
}

export function addLightIfNew(lights: Light[], sentence: string): Light[] | null {
  const normalized = sentence.trim()
  if (!normalized || hasLightToday(lights, normalized)) return null
  return [
    { id: `${Date.now()}`, sentence: normalized, date: formatToday(), daysAgo: 0 },
    ...lights,
  ]
}

export function removeLight(lights: Light[], id: string): Light[] {
  return lights.filter((light) => light.id !== id)
}

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

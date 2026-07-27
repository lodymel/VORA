import type { Light } from './constants'
import { dateLocaleTag, type VoraLocale } from './locale'

function calendarParts(daysAgo: number, locale: VoraLocale = 'en', now = new Date()) {
  const d = new Date(now)
  d.setHours(12, 0, 0, 0)
  const offset = Math.max(0, Math.floor(Number(daysAgo) || 0))
  if (offset > 0) d.setDate(d.getDate() - offset)
  const tag = dateLocaleTag(locale)
  return {
    weekday: new Intl.DateTimeFormat(tag, { weekday: 'short' }).format(d),
    date: new Intl.DateTimeFormat(tag, { month: 'short', day: 'numeric' }).format(d),
  }
}

export function formatSkyDate(light: Light | null, locale: VoraLocale = 'en') {
  if (!light) return calendarParts(0, locale)
  const daysAgo = Math.max(0, Math.floor(Number(light.daysAgo) || 0))
  return calendarParts(daysAgo, locale)
}

/** Short label above a constellation star. */
export function formatStarDateLabel(light: Light, locale: VoraLocale = 'en'): string {
  return formatSkyDate(light, locale).date
}

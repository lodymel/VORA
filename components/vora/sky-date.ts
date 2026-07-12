import type { Light } from './constants'

function calendarParts(daysAgo: number, now = new Date()) {
  const d = new Date(now)
  d.setHours(12, 0, 0, 0)
  const offset = Math.max(0, Math.floor(Number(daysAgo) || 0))
  if (offset > 0) d.setDate(d.getDate() - offset)
  return {
    weekday: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d),
    date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d),
  }
}

export function formatSkyDate(light: Light | null) {
  if (!light) return calendarParts(0)

  const daysAgo = Math.max(0, Math.floor(Number(light.daysAgo) || 0))
  const parts = calendarParts(daysAgo)

  // Prefer the stored month-day label when present (survives stale daysAgo bugs).
  if (light.date && light.date !== 'Today') {
    return { weekday: parts.weekday, date: light.date }
  }

  return parts
}

/** Short label above a constellation star. */
export function formatStarDateLabel(light: Light): string {
  return formatSkyDate(light).date
}

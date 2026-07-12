import type { Light } from './constants'

const TODAY_WEEKDAY = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date())
const TODAY_DATE = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date())

export function formatSkyDate(light: Light | null) {
  if (!light || light.daysAgo === 0) {
    return { weekday: TODAY_WEEKDAY, date: TODAY_DATE }
  }

  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - light.daysAgo)

  return {
    weekday: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d),
    date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d),
  }
}

/** Short label above a constellation star on hover. */
export function formatStarDateLabel(light: Light): string {
  return formatSkyDate(light).date
}

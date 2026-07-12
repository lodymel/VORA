/**
 * Daily Light reminders — one schedule, many times.
 * Native local notifications can map each time later.
 */

export type ReminderTime = {
  id: string
  /** 0–23 */
  hour: number
  /** 0–59 */
  minute: number
}

export type LightReminder = {
  enabled: boolean
  times: ReminderTime[]
}

/** Legacy Me radio — migrate once, then drop. */
export type NotificationPreference = 'morning' | 'evening' | 'off'

/** Legacy single-slot shape before multi-time. */
type LegacySingleReminder = {
  enabled: boolean
  hour: number
  minute: number
}

export const MAX_REMINDER_TIMES = 5

export const REMINDER_PRESETS = [
  { id: 'morning', label: 'Morning', hour: 6, minute: 0 },
  { id: 'midday', label: 'Midday', hour: 12, minute: 0 },
  { id: 'evening', label: 'Evening', hour: 18, minute: 0 },
] as const

/** Minutes step in the VORA picker — every minute for real alarms. */
export const REMINDER_MINUTE_STEP = 1

export function clampHour(value: number) {
  if (!Number.isFinite(value)) return 6
  return Math.min(23, Math.max(0, Math.round(value)))
}

export function clampMinute(value: number) {
  if (!Number.isFinite(value)) return 0
  const raw = Math.min(59, Math.max(0, Math.round(value)))
  return (Math.round(raw / REMINDER_MINUTE_STEP) * REMINDER_MINUTE_STEP) % 60
}

export function formatReminderClock(hour: number, minute: number) {
  return `${String(clampHour(hour)).padStart(2, '0')}:${String(clampMinute(minute)).padStart(2, '0')}`
}

export function reminderTimeKey(hour: number, minute: number) {
  return formatReminderClock(hour, minute)
}

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createReminderTime(hour: number, minute: number): ReminderTime {
  return {
    id: newId(),
    hour: clampHour(hour),
    minute: clampMinute(minute),
  }
}

export function sortReminderTimes(times: ReminderTime[]): ReminderTime[] {
  return [...times].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
}

export function dedupeReminderTimes(times: ReminderTime[]): ReminderTime[] {
  const seen = new Set<string>()
  const out: ReminderTime[] = []
  for (const t of sortReminderTimes(times)) {
    const key = reminderTimeKey(t.hour, t.minute)
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      id: t.id || newId(),
      hour: clampHour(t.hour),
      minute: clampMinute(t.minute),
    })
  }
  return out.slice(0, MAX_REMINDER_TIMES)
}

export const DEFAULT_LIGHT_REMINDER: LightReminder = {
  enabled: true,
  times: [createReminderTime(6, 0)],
}

export function normalizeLightReminder(raw: unknown): LightReminder | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  if (
    typeof r.enabled === 'boolean' &&
    typeof r.hour === 'number' &&
    typeof r.minute === 'number' &&
    !Array.isArray(r.times)
  ) {
    const legacy = r as unknown as LegacySingleReminder
    return {
      enabled: legacy.enabled,
      times: dedupeReminderTimes([createReminderTime(legacy.hour, legacy.minute)]),
    }
  }

  if (typeof r.enabled !== 'boolean' || !Array.isArray(r.times)) return null

  const times = dedupeReminderTimes(
    r.times
      .filter((t): t is ReminderTime => !!t && typeof t === 'object')
      .map((t) => ({
        id: typeof t.id === 'string' && t.id ? t.id : newId(),
        hour: clampHour(Number(t.hour)),
        minute: clampMinute(Number(t.minute)),
      })),
  )

  return {
    enabled: r.enabled,
    times: times.length > 0 ? times : [createReminderTime(6, 0)],
  }
}

export function migratePreferenceToReminder(
  pref?: NotificationPreference | null,
): LightReminder {
  if (!pref || pref === 'off') {
    return { enabled: false, times: [createReminderTime(6, 0)] }
  }
  if (pref === 'evening') {
    return { enabled: true, times: [createReminderTime(18, 0)] }
  }
  return { enabled: true, times: [createReminderTime(6, 0)] }
}

export function reminderSummary(reminder: LightReminder) {
  if (!reminder.enabled || reminder.times.length === 0) return 'Off'
  if (reminder.times.length === 1) {
    return `Every day · ${formatReminderClock(reminder.times[0].hour, reminder.times[0].minute)}`
  }
  return `Every day · ${reminder.times.length} times`
}

export function hasReminderTime(reminder: LightReminder, hour: number, minute: number) {
  const key = reminderTimeKey(hour, minute)
  return reminder.times.some((t) => reminderTimeKey(t.hour, t.minute) === key)
}

export function addReminderTime(
  reminder: LightReminder,
  hour: number,
  minute: number,
): LightReminder {
  if (reminder.times.length >= MAX_REMINDER_TIMES) return reminder
  if (hasReminderTime(reminder, hour, minute)) {
    return { ...reminder, enabled: true }
  }
  return {
    enabled: true,
    times: dedupeReminderTimes([...reminder.times, createReminderTime(hour, minute)]),
  }
}

export function updateReminderTime(
  reminder: LightReminder,
  id: string,
  hour: number,
  minute: number,
): LightReminder {
  const next = reminder.times.map((t) =>
    t.id === id
      ? { ...t, hour: clampHour(hour), minute: clampMinute(minute) }
      : t,
  )
  return {
    ...reminder,
    enabled: true,
    times: dedupeReminderTimes(next),
  }
}

export function removeReminderTime(reminder: LightReminder, id: string): LightReminder {
  const times = reminder.times.filter((t) => t.id !== id)
  if (times.length === 0) {
    return { enabled: false, times: [createReminderTime(6, 0)] }
  }
  return { ...reminder, times: dedupeReminderTimes(times) }
}

/** Next fire among enabled times (ms from now). */
export function msUntilNextReminder(times: ReminderTime[], from = new Date()): number | null {
  if (times.length === 0) return null
  let best = Infinity
  for (const t of times) {
    const next = new Date(from)
    next.setSeconds(0, 0)
    next.setHours(clampHour(t.hour), clampMinute(t.minute), 0, 0)
    if (next.getTime() <= from.getTime()) {
      next.setDate(next.getDate() + 1)
    }
    best = Math.min(best, next.getTime() - from.getTime())
  }
  return Number.isFinite(best) ? Math.max(250, best) : null
}

export function reminderTimesAtClock(
  times: ReminderTime[],
  hour: number,
  minute: number,
): ReminderTime[] {
  const key = reminderTimeKey(hour, minute)
  return times.filter((t) => reminderTimeKey(t.hour, t.minute) === key)
}

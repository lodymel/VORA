'use client'

import type { LightReminder, ReminderTime } from './light-reminder'
import {
  formatReminderClock,
  msUntilNextReminder,
  reminderTimesAtClock,
} from './light-reminder'

export type ReminderCapability = {
  canNotify: boolean
  permission: NotificationPermission | 'unsupported'
  limitNote: string
}

type ScheduleArgs = {
  reminder: LightReminder
  getBody: () => string
}

let activeTimer: number | null = null
let lastFiredSlot: string | null = null
let getBodyFn: (() => string) | null = null
let activeReminder: LightReminder | null = null

function clearTimer() {
  if (activeTimer != null) {
    window.clearTimeout(activeTimer)
    activeTimer = null
  }
}

function slotKey(d: Date, hour: number, minute: number) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}@${formatReminderClock(hour, minute)}`
}

async function fireNotification(body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    const n = new Notification('VORA', {
      body: body.trim() || 'Your Light is waiting.',
      tag: 'vora-daily-light',
    })
    window.setTimeout(() => n.close(), 8000)
  } catch {
    // Permission revoked mid-flight — ignore.
  }
}

function armTimer() {
  clearTimer()
  if (!activeReminder?.enabled || !getBodyFn) return
  const times = activeReminder.times
  if (times.length === 0) return

  const delay = msUntilNextReminder(times)
  if (delay == null) return

  activeTimer = window.setTimeout(() => {
    const now = new Date()
    const due = reminderTimesAtClock(times, now.getHours(), now.getMinutes())
    for (const t of due) {
      const key = slotKey(now, t.hour, t.minute)
      if (lastFiredSlot === key) continue
      lastFiredSlot = key
      void fireNotification(getBodyFn?.() ?? '')
      break
    }
    armTimer()
  }, Math.min(delay, 30_000))
}

export function getReminderCapability(): ReminderCapability {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      canNotify: false,
      permission: 'unsupported',
      limitNote: 'This browser cannot show reminders. Your times are still saved.',
    }
  }
  return {
    canNotify: true,
    permission: Notification.permission,
    limitNote:
      'On the web, VORA can remind you while this tab is open. Background alerts come with the app.',
  }
}

export async function requestReminderPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export function scheduleWebReminder({ reminder, getBody }: ScheduleArgs) {
  if (typeof window === 'undefined') return
  getBodyFn = getBody
  activeReminder = {
    enabled: reminder.enabled,
    times: reminder.times.map((t: ReminderTime) => ({ ...t })),
  }
  if (!reminder.enabled || reminder.times.length === 0) {
    clearTimer()
    return
  }
  armTimer()
}

export function cancelWebReminder() {
  clearTimer()
  activeReminder = null
  getBodyFn = null
}

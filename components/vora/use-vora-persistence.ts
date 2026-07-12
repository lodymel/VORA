'use client'

import { useEffect, useState } from 'react'
import type { Tab } from './nav-bar'
import { SEED_LIGHTS, dedupeLights, type Light, type NotificationPreference } from './constants'
import {
  DEFAULT_LIGHT_REMINDER,
  migratePreferenceToReminder,
  normalizeLightReminder,
  type LightReminder,
} from './light-reminder'
import {
  DEFAULT_SKY_THEME,
  normalizeSkyThemeId,
  type SkyThemeId,
} from './light-card-theme'

export type AppStage = 'splash' | 'onboarding' | 'app'

const STORAGE_KEY = 'vora-app-v1'

type PersistedState = {
  stage: AppStage
  tab: Tab | 'mirror'
  lights: Light[]
  /** Current model */
  lightReminder?: LightReminder
  /** Legacy Me radio — migrate once */
  notificationPreference?: NotificationPreference
  skyTheme?: SkyThemeId
  /** First day they entered the sky — for warm “Day n with you.” */
  startedAt?: string
  /** Soft VORA+ — home/lock later; no account required */
  isSubscribed?: boolean
  isMember?: boolean
}

function todayIsoDate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Calendar days with VORA, inclusive of the first day. */
export function daysWithVora(startedAt: string) {
  const start = new Date(`${startedAt}T12:00:00`)
  if (Number.isNaN(start.getTime())) return 1
  const now = new Date()
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.max(1, Math.floor((b - a) / 86_400_000) + 1)
}

function loadState(): PersistedState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Private mode or quota — fail silently
  }
}

function resolveReminder(saved: PersistedState | null): LightReminder {
  const fromNew = normalizeLightReminder(saved?.lightReminder)
  if (fromNew) return fromNew
  if (saved?.notificationPreference) {
    return migratePreferenceToReminder(saved.notificationPreference)
  }
  return { ...DEFAULT_LIGHT_REMINDER }
}

export function useVoraPersistence() {
  const [hydrated, setHydrated] = useState(false)
  const [stage, setStage] = useState<AppStage>('splash')
  const [tab, setTab] = useState<Tab>('sky')
  const [lights, setLights] = useState<Light[]>(SEED_LIGHTS)
  const [lightReminder, setLightReminder] = useState<LightReminder>(DEFAULT_LIGHT_REMINDER)
  const [skyTheme, setSkyTheme] = useState<SkyThemeId>(DEFAULT_SKY_THEME)
  const [startedAt, setStartedAt] = useState(todayIsoDate)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const saved = loadState()
    if (saved) {
      setStage(saved.stage === 'app' ? 'app' : 'splash')
      setTab(saved.tab === 'profile' ? 'profile' : 'sky')
      setLights(dedupeLights(saved.lights ?? SEED_LIGHTS))
      setLightReminder(resolveReminder(saved))
      const theme = normalizeSkyThemeId(saved.skyTheme)
      if (theme) setSkyTheme(theme)
      if (saved.startedAt) setStartedAt(saved.startedAt)
      else setStartedAt(todayIsoDate())
      if (saved.isSubscribed || saved.isMember) setIsSubscribed(true)
    } else {
      setStartedAt(todayIsoDate())
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveState({
      stage,
      tab,
      lights,
      lightReminder,
      skyTheme,
      startedAt,
      isSubscribed,
    })
  }, [hydrated, stage, tab, lights, lightReminder, skyTheme, startedAt, isSubscribed])

  return {
    hydrated,
    stage,
    setStage,
    tab,
    setTab,
    lights,
    setLights,
    lightReminder,
    setLightReminder,
    skyTheme,
    setSkyTheme,
    startedAt,
    days: daysWithVora(startedAt),
    isSubscribed,
    setIsSubscribed,
  }
}

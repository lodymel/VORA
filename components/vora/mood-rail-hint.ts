const KEY = 'vora-mood-rail-known'

/** True after the user has received a category Light once. */
export function hasKnownMoodRail() {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

export function markMoodRailKnown() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, '1')
  } catch {
    // Private mode — ignore
  }
}

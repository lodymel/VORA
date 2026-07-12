const KEY = 'vora-write-own-known'

/** True after the user has opened write once — invite stays quiet forever after. */
export function hasKnownWriteOwn() {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

export function markWriteOwnKnown() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, '1')
  } catch {
    // Private mode — ignore
  }
}

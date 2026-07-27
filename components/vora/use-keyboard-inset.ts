'use client'

import { useEffect } from 'react'

/**
 * Publishes --vora-keyboard-inset so write CTAs can sit above the soft keyboard
 * on Android / iOS WebViews (visualViewport).
 */
export function useKeyboardInset(active = true) {
  useEffect(() => {
    if (!active || typeof window === 'undefined') return
    const root = document.documentElement
    const vv = window.visualViewport

    const sync = () => {
      if (!vv) {
        root.style.setProperty('--vora-keyboard-inset', '0px')
        return
      }
      const inset = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
      root.style.setProperty('--vora-keyboard-inset', `${inset}px`)
    }

    sync()
    vv?.addEventListener('resize', sync)
    vv?.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)
    return () => {
      vv?.removeEventListener('resize', sync)
      vv?.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      root.style.setProperty('--vora-keyboard-inset', '0px')
    }
  }, [active])
}

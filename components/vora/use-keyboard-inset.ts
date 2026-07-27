'use client'

import { useEffect } from 'react'

/**
 * Publishes --vora-keyboard-inset so chrome can sit above the soft keyboard.
 *
 * Android Capacitor uses windowSoftInputMode=adjustResize — the WebView already
 * shrinks. Adding visualViewport inset on top double-compresses the write UI
 * (Notes never does this). Only apply inset when the layout did not resize.
 */
export function useKeyboardInset(active = true) {
  useEffect(() => {
    if (!active || typeof window === 'undefined') return
    const root = document.documentElement
    const vv = window.visualViewport
    const android = /Android/i.test(navigator.userAgent)

    const sync = () => {
      if (!vv || android) {
        // adjustResize already owns the visible height on Android.
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

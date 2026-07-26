'use client'

import { useEffect, useState } from 'react'

/** Touch / phone — prefer flat, cheap motion. */
export function isCoarsePointer() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: none), (pointer: coarse)').matches
}

/** Sync first paint with the real pointer type (avoids false→true snap on Android). */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(isCoarsePointer)
  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)')
    const sync = () => setCoarse(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return coarse
}

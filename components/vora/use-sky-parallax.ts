'use client'

import { useEffect, useState } from 'react'
import { isCoarsePointer } from './pointer-env'

/** Pointer parallax — sky leans with you. Off on touch / reduced-motion. */
export function useSkyParallax(enabled = true, reach = 1) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || isCoarsePointer()) return

    let frame = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let running = false
    const maxX = 14 * reach
    const maxY = 10 * reach

    function onMove(event: PointerEvent) {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      targetX = ((event.clientX - cx) / cx) * maxX
      targetY = ((event.clientY - cy) / cy) * maxY
      if (!running) {
        running = true
        frame = window.requestAnimationFrame(tick)
      }
    }

    function tick() {
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05
      if (Math.abs(currentX - targetX) < 0.05 && Math.abs(currentY - targetY) < 0.05) {
        currentX = targetX
        currentY = targetY
        setOffset({ x: currentX, y: currentY })
        running = false
        return
      }
      setOffset({ x: currentX, y: currentY })
      frame = window.requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.cancelAnimationFrame(frame)
    }
  }, [enabled, reach])

  return offset
}

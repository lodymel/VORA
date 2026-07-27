'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { isCoarsePointer } from './pointer-env'

export type WorldScale = {
  x: number
  y: number
  explorable: boolean
}

/** Sky is always a place to wander — it only grows as Lights gather. */
export function getConstellationWorldScale(count: number): WorldScale {
  const extra = Math.max(0, count - 1)
  return {
    x: 1.22 + Math.min(1.2, extra * 0.1),
    y: 1.16 + Math.min(0.9, extra * 0.08),
    explorable: true,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function writeWorldTransform(el: HTMLElement | null, x: number, y: number, flat: boolean) {
  if (!el) return
  // Phone: pure 2D pan — 3D tilt is too expensive for Android WebView.
  if (flat) {
    el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0)`
    return
  }
  // Quiet cinematic tilt — explore as graphic motion, not UI chrome.
  // Skip tiny rotates: 3D + perspective makes star hit-testing flicker the cursor.
  const yaw = clamp(x * 0.01, -2.4, 2.4)
  const pitch = clamp(-y * 0.008, -1.8, 1.8)
  if (Math.abs(yaw) < 0.05 && Math.abs(pitch) < 0.05) {
    el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0)`
    return
  }
  el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) rotateZ(${yaw}deg) rotateX(${pitch}deg)`
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  // Stars stay draggable — their click handler already ignores didDrag.
  if (target.closest('.vora-constellation-node')) return false
  return Boolean(
    target.closest('button, a, textarea, input, select, label, [contenteditable="true"], [role="button"]'),
  )
}

/**
 * Gesture surface is the constellation stage only — Sky copy below can scroll.
 * Wandering cursor class still lives on the page.
 */
export function useConstellationPan(
  pageRef: RefObject<HTMLElement | null>,
  stageRef: RefObject<HTMLElement | null>,
  worldRef: RefObject<HTMLElement | null>,
  scale: WorldScale,
  resetKey = 0,
) {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [explore, setExplore] = useState({ x: 0, y: 0 })
  const panRef = useRef(pan)
  const flatRef = useRef(false)
  const didDrag = useRef(false)
  const dragging = useRef(false)
  const pointerId = useRef<number | null>(null)
  const start = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const lastMove = useRef({ t: 0, x: 0, y: 0 })
  const inertiaFrame = useRef(0)
  const exploreFrame = useRef(0)

  panRef.current = pan

  useEffect(() => {
    flatRef.current = isCoarsePointer()
  }, [])

  const boundsFor = useCallback(
    (el: HTMLElement | null) => {
      if (!el || !scale.explorable) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
      const w = el.clientWidth
      const h = el.clientHeight
      const extraX = Math.max(0, (w * scale.x - w) / 2)
      const extraY = Math.max(0, (h * scale.y - h) / 2)
      return {
        minX: -extraX,
        maxX: extraX,
        minY: -extraY,
        maxY: extraY,
      }
    },
    [scale.explorable, scale.x, scale.y],
  )

  const publishExplore = useCallback((x: number, y: number) => {
    // Touch devices skip atmosphere parallax — don't re-render Sky each frame.
    if (flatRef.current) return
    if (exploreFrame.current) return
    exploreFrame.current = window.requestAnimationFrame(() => {
      exploreFrame.current = 0
      setExplore({ x, y })
    })
  }, [])

  const setWandering = useCallback(
    (on: boolean) => {
      const page = pageRef.current
      if (!page) return
      page.classList.toggle('vora-sky-page--wandering', on)
    },
    [pageRef],
  )

  const applyPan = useCallback(
    (x: number, y: number, commit = false) => {
      panRef.current = { x, y }
      writeWorldTransform(worldRef.current, x, y, flatRef.current)
      publishExplore(x, y)
      if (commit) setPan({ x, y })
    },
    [publishExplore, worldRef],
  )

  useEffect(() => {
    applyPan(0, 0, true)
    didDrag.current = false
    setWandering(false)
    window.cancelAnimationFrame(inertiaFrame.current)
    window.cancelAnimationFrame(exploreFrame.current)
  }, [applyPan, resetKey, scale.explorable, scale.x, scale.y, setWandering])

  useEffect(() => {
    if (!scale.explorable) {
      applyPan(0, 0, true)
      return
    }

    const gestureEl = stageRef.current
    if (!gestureEl) return
    const surface = gestureEl

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function stopInertia() {
      window.cancelAnimationFrame(inertiaFrame.current)
    }

    function runInertia() {
      if (reduce) {
        applyPan(panRef.current.x, panRef.current.y, true)
        return
      }

      const tick = () => {
        const b = boundsFor(stageRef.current)
        velocity.current.x *= 0.9
        velocity.current.y *= 0.9
        if (Math.abs(velocity.current.x) < 0.2 && Math.abs(velocity.current.y) < 0.2) {
          applyPan(panRef.current.x, panRef.current.y, true)
          return
        }
        applyPan(
          clamp(panRef.current.x + velocity.current.x, b.minX, b.maxX),
          clamp(panRef.current.y + velocity.current.y, b.minY, b.maxY),
        )
        inertiaFrame.current = window.requestAnimationFrame(tick)
      }
      inertiaFrame.current = window.requestAnimationFrame(tick)
    }

    function onDown(event: PointerEvent) {
      if (event.button !== 0) return
      if (isInteractiveTarget(event.target)) return
      stopInertia()
      dragging.current = true
      didDrag.current = false
      pointerId.current = event.pointerId
      start.current = {
        x: event.clientX,
        y: event.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      }
      lastMove.current = { t: performance.now(), x: event.clientX, y: event.clientY }
      velocity.current = { x: 0, y: 0 }
    }

    function onMove(event: PointerEvent) {
      if (!dragging.current || pointerId.current !== event.pointerId) return

      const dx = event.clientX - start.current.x
      const dy = event.clientY - start.current.y

      if (!didDrag.current) {
        if (Math.hypot(dx, dy) < 12) return
        didDrag.current = true
        setWandering(true)
        try {
          surface.setPointerCapture(event.pointerId)
        } catch {
          // ignore
        }
      }

      event.preventDefault()
      const b = boundsFor(stageRef.current)
      applyPan(
        clamp(start.current.panX + dx, b.minX, b.maxX),
        clamp(start.current.panY + dy, b.minY, b.maxY),
      )

      const now = performance.now()
      const dt = Math.max(1, now - lastMove.current.t)
      const frame = 16.7 / dt
      velocity.current = {
        x: (event.clientX - lastMove.current.x) * frame * 0.55,
        y: (event.clientY - lastMove.current.y) * frame * 0.55,
      }
      lastMove.current = { t: now, x: event.clientX, y: event.clientY }
    }

    function onUp(event: PointerEvent) {
      if (!dragging.current || pointerId.current !== event.pointerId) return
      dragging.current = false
      pointerId.current = null
      try {
        surface.releasePointerCapture(event.pointerId)
      } catch {
        // ignore
      }
      if (didDrag.current) runInertia()
      else applyPan(panRef.current.x, panRef.current.y, true)
      window.setTimeout(() => {
        didDrag.current = false
        setWandering(false)
      }, 40)
    }

    surface.addEventListener('pointerdown', onDown)
    surface.addEventListener('pointermove', onMove, { passive: false })
    surface.addEventListener('pointerup', onUp)
    surface.addEventListener('pointercancel', onUp)

    return () => {
      stopInertia()
      window.cancelAnimationFrame(exploreFrame.current)
      setWandering(false)
      surface.removeEventListener('pointerdown', onDown)
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerup', onUp)
      surface.removeEventListener('pointercancel', onUp)
    }
  }, [applyPan, boundsFor, scale.explorable, setWandering, stageRef, worldRef])

  return { pan, panRef, didDrag, explore, scale }
}

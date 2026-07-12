'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DEFAULT_SKY_THEME, type SkyThemeId } from './light-card-theme'

export type CursorSurface = 'sky' | 'me'

type Rgb = { r: number; g: number; b: number }

type Particle = {
  alive: boolean
  x: number
  y: number
  vx: number
  vy: number
  r: number
  life: number
  maxLife: number
  col: Rgb
  flare: boolean
  density: number
}

const POOL = 160

function pick(palette: readonly Rgb[], rand = Math.random()): Rgb {
  const i = Math.min(palette.length - 1, Math.floor(rand * palette.length))
  return palette[i]
}

/** Night sky trails — pearl core + themed mist (additive glow). */
const SKY_TRAIL: Record<SkyThemeId, readonly Rgb[]> = {
  default: [
    { r: 255, g: 252, b: 250 },
    { r: 228, g: 217, b: 255 },
    { r: 203, g: 184, b: 255 },
    { r: 180, g: 200, b: 255 },
    { r: 240, g: 232, b: 255 },
  ],
  pure: [
    { r: 255, g: 250, b: 247 },
    { r: 247, g: 241, b: 255 },
    { r: 228, g: 217, b: 255 },
    { r: 196, g: 175, b: 255 },
    { r: 203, g: 184, b: 255 },
  ],
  pink: [
    { r: 255, g: 250, b: 252 },
    { r: 255, g: 220, b: 236 },
    { r: 255, g: 190, b: 220 },
    { r: 232, g: 208, b: 255 },
    { r: 255, g: 200, b: 230 },
  ],
  black: [
    { r: 255, g: 252, b: 250 },
    { r: 240, g: 236, b: 255 },
    { r: 210, g: 200, b: 230 },
    { r: 180, g: 175, b: 210 },
    { r: 228, g: 217, b: 255 },
  ],
  aurora: [
    { r: 245, g: 255, b: 252 },
    { r: 160, g: 230, b: 210 },
    { r: 130, g: 245, b: 210 },
    { r: 140, g: 180, b: 255 },
    { r: 180, g: 220, b: 240 },
  ],
}

/** Me — ink on morning mist; chroma follows sky theme. */
const ME_TRAIL: Record<SkyThemeId, readonly Rgb[]> = {
  default: [
    { r: 61, g: 53, b: 88 },
    { r: 90, g: 72, b: 140 },
    { r: 129, g: 113, b: 201 },
    { r: 155, g: 138, b: 210 },
    { r: 180, g: 165, b: 220 },
  ],
  pure: [
    { r: 80, g: 65, b: 130 },
    { r: 110, g: 90, b: 170 },
    { r: 160, g: 140, b: 220 },
    { r: 175, g: 155, b: 230 },
    { r: 196, g: 175, b: 255 },
  ],
  pink: [
    { r: 120, g: 60, b: 95 },
    { r: 160, g: 80, b: 120 },
    { r: 200, g: 110, b: 155 },
    { r: 220, g: 140, b: 175 },
    { r: 232, g: 170, b: 200 },
  ],
  black: [
    { r: 55, g: 52, b: 78 },
    { r: 80, g: 74, b: 110 },
    { r: 120, g: 110, b: 150 },
    { r: 140, g: 130, b: 170 },
    { r: 165, g: 158, b: 190 },
  ],
  aurora: [
    { r: 30, g: 90, b: 85 },
    { r: 40, g: 120, b: 110 },
    { r: 50, g: 170, b: 150 },
    { r: 70, g: 185, b: 165 },
    { r: 100, g: 200, b: 190 },
  ],
}

function skyTrailColor(theme: SkyThemeId, rand = Math.random()): Rgb {
  return pick(SKY_TRAIL[theme] ?? SKY_TRAIL.default, rand)
}

function meTrailColor(theme: SkyThemeId, rand = Math.random()): Rgb {
  return pick(ME_TRAIL[theme] ?? ME_TRAIL.default, rand)
}

function rgba(c: Rgb, a: number) {
  const alpha = Number.isFinite(a) ? Math.min(1, Math.max(0, a)) : 0
  return `rgba(${c.r},${c.g},${c.b},${alpha})`
}

function makeParticle(): Particle {
  return {
    alive: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 0,
    life: 0,
    maxLife: 0,
    col: skyTrailColor(DEFAULT_SKY_THEME, 0),
    flare: false,
    density: 1,
  }
}

/**
 * Cursor presence — surface + sky-theme mote trail + one VORA O-star tip.
 * Portaled to body (above Light card) — carries data-sky-theme for tip tokens.
 */
export function CursorStarTrail({
  enabled = true,
  surface = 'sky',
  skyTheme = DEFAULT_SKY_THEME,
}: {
  enabled?: boolean
  surface?: CursorSurface
  skyTheme?: SkyThemeId
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starRef = useRef<HTMLSpanElement>(null)
  const surfaceRef = useRef<CursorSurface>(surface)
  const themeRef = useRef<SkyThemeId>(skyTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    surfaceRef.current = surface
  }, [surface])

  useEffect(() => {
    themeRef.current = skyTheme
  }, [skyTheme])

  useEffect(() => {
    if (!enabled || !mounted || typeof window === 'undefined') return

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduce.matches) return

    const canvasMaybe = canvasRef.current
    const tipMaybe = starRef.current
    if (!canvasMaybe || !tipMaybe) return
    const contextMaybe = canvasMaybe.getContext('2d', { alpha: true })
    if (!contextMaybe) return

    // Explicit locals — TS does not keep null-narrowing inside nested tick closures
    const canvasNode: HTMLCanvasElement = canvasMaybe
    const tipNode: HTMLSpanElement = tipMaybe
    const context: CanvasRenderingContext2D = contextMaybe

    const pool: Particle[] = Array.from({ length: POOL }, makeParticle)
    let prevX = window.innerWidth / 2
    let prevY = window.innerHeight / 2
    let tipX = prevX
    let tipY = prevY
    let tipVisible = false
    let tipIdleTimer = 0
    let lastTs = 0
    let raf = 0
    let inputRects: DOMRect[] = []
    let running = true

    const TRAIL = {
      densityMul: 1,
      sizeMul: 1,
      countCap: 3,
      countCoef: 0.07,
      countBase: 1,
    }

    function hideTip() {
      tipVisible = false
      tipNode.style.opacity = '0'
    }

    function showTip() {
      tipVisible = true
      tipNode.style.opacity = '1'
      window.clearTimeout(tipIdleTimer)
      // Dissolve when still — never leave a stranded O-star on the sky
      tipIdleTimer = window.setTimeout(hideTip, 720)
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      canvasNode.width = Math.floor(w * dpr)
      canvasNode.height = Math.floor(h * dpr)
      canvasNode.style.width = `${w}px`
      canvasNode.style.height = `${h}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function refreshInputs() {
      inputRects = []
      document.querySelectorAll('input, textarea, [contenteditable="true"]').forEach((node) => {
        const el = node as HTMLInputElement
        if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button') return
        inputRects.push(el.getBoundingClientRect())
      })
    }

    function overInput(x: number, y: number) {
      return inputRects.some(
        (r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom,
      )
    }

    function acquire() {
      for (let i = 0; i < pool.length; i++) {
        if (!pool[i].alive) return pool[i]
      }
      return null
    }

    function spawn(x: number, y: number, dx: number, dy: number) {
      const p = acquire()
      if (!p) return
      const me = surfaceRef.current === 'me'
      const theme = themeRef.current
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      p.alive = true
      p.x = x + (Math.random() - 0.5) * 1.5
      p.y = y + (Math.random() - 0.5) * 1.5
      p.vx = (dx / len) * 1.15 + (Math.random() - 0.5) * 0.28
      p.vy = (dy / len) * 1.15 + (Math.random() - 0.5) * 0.28
      p.r = (0.35 + Math.pow(Math.random(), 2) * 2.1) * TRAIL.sizeMul
      p.life = 0
      p.maxLife = 0.42 + Math.random() * 0.5
      p.col = me ? meTrailColor(theme) : skyTrailColor(theme)
      p.flare = p.r > 1.4
      // Me ink needs a touch more body on pearl paper
      p.density = TRAIL.densityMul * (me ? 1.15 : 1)
    }

    function onMove(event: MouseEvent) {
      const x = event.clientX
      const y = event.clientY
      const dx = x - prevX
      const dy = y - prevY
      prevX = x
      prevY = y

      if (overInput(x, y)) {
        hideTip()
        return
      }

      if (!tipVisible) {
        tipX = x
        tipY = y
      }
      showTip()

      const speed = Math.sqrt(dx * dx + dy * dy)
      const count = Math.min(
        Math.floor(TRAIL.countBase + speed * TRAIL.countCoef),
        TRAIL.countCap,
      )
      for (let i = 0; i < count; i++) {
        spawn(x, y, dx, dy)
      }
    }

    function onLeave() {
      hideTip()
    }

    function tick(ts: number) {
      if (!running) return
      const dt = lastTs ? Math.min(0.033, (ts - lastTs) / 1000) : 0.016
      lastTs = ts

      const me = surfaceRef.current === 'me'
      tipX += (prevX - tipX) * 0.38
      tipY += (prevY - tipY) * 0.38
      tipNode.style.transform = `translate3d(${tipX - 7}px, ${tipY - 7}px, 0)`

      context.clearRect(0, 0, canvasNode.width, canvasNode.height)
      // Sky: additive glow. Me: normal ink on light paper (lighter washes out).
      context.globalCompositeOperation = me ? 'source-over' : 'lighter'

      for (let i = 0; i < pool.length; i++) {
        const p = pool[i]
        if (!p.alive) continue
        p.life += dt
        if (p.life >= p.maxLife) {
          p.alive = false
          continue
        }
        const t = p.life / p.maxLife
        const fade = 1 - t
        const alpha = fade * fade * p.density * (me ? 0.72 : 0.55)
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96

        const radius = Math.max(p.r * (1 - t * 0.35), 0.01)
        if (p.flare) {
          const glowR = Math.max(radius * (me ? 3.6 : 4.8), 0.01)
          const g = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR)
          g.addColorStop(0, rgba(p.col, alpha * (me ? 0.38 : 0.45)))
          g.addColorStop(1, rgba(p.col, 0))
          context.fillStyle = g
          context.beginPath()
          context.arc(p.x, p.y, glowR, 0, Math.PI * 2)
          context.fill()
        }

        if (p.flare && !me) {
          context.beginPath()
          context.strokeStyle = rgba(p.col, alpha * 0.28)
          context.lineWidth = 0.6
          const arm = radius * 2.2
          context.moveTo(p.x - arm, p.y)
          context.lineTo(p.x + arm, p.y)
          context.moveTo(p.x, p.y - arm)
          context.lineTo(p.x, p.y + arm)
          context.stroke()
        }

        context.beginPath()
        context.fillStyle = rgba(p.col, alpha * (me ? 1 : 0.95))
        context.arc(p.x, p.y, radius, 0, Math.PI * 2)
        context.fill()
      }

      raf = window.requestAnimationFrame(tick)
    }

    resize()
    refreshInputs()
    const inputObserver = window.setInterval(refreshInputs, 1200)
    window.addEventListener('resize', resize)
    window.addEventListener('resize', refreshInputs)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    window.addEventListener('blur', onLeave)
    raf = window.requestAnimationFrame(tick)

    function onFineChange() {
      if (!fine.matches) {
        running = false
        hideTip()
      }
    }
    fine.addEventListener?.('change', onFineChange)

    return () => {
      running = false
      window.cancelAnimationFrame(raf)
      window.clearTimeout(tipIdleTimer)
      window.clearInterval(inputObserver)
      window.removeEventListener('resize', resize)
      window.removeEventListener('resize', refreshInputs)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('blur', onLeave)
      fine.removeEventListener?.('change', onFineChange)
      hideTip()
    }
  }, [enabled, mounted])

  if (!mounted) return null

  return createPortal(
    <>
      <canvas
        ref={canvasRef}
        className="vora-cursor-star-trail"
        data-vora-cursor-surface={surface}
        data-sky-theme={skyTheme}
        aria-hidden="true"
      />
      <span
        ref={starRef}
        className={`vora-cursor-o-star${surface === 'me' ? ' vora-cursor-o-star--me' : ''}`}
        data-vora-cursor-surface={surface}
        data-sky-theme={skyTheme}
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path
            d="M24 8 C24.55 15.2 32.8 23.45 40 24 C32.8 24.55 24.55 32.8 24 40 C23.45 32.8 15.2 24.55 8 24 C15.2 23.45 23.45 15.2 24 8 Z"
            fill="var(--vora-o-star-core, rgb(255 252 250 / 96%))"
          />
        </svg>
      </span>
    </>,
    document.body,
  )
}

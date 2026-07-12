'use client'

import type { Light } from './constants'
import { getConstellationWorldScale } from './use-constellation-pan'

function seedFromId(id: string, n: number) {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const x = Math.sin(seed * n) * 10000
  return x - Math.floor(x)
}

export type ConstellationNode = {
  light: Light
  x: number
  y: number
  size: number
  twinkleDuration: number
  twinkleDelay: number
}

/**
 * Editorial sky layout — air first, Lights as rare points of meaning.
 * As the sky fills, the path opens wider for exploration.
 *
 * Keep a soft frame at rest: date + whisper stick past the star, and the
 * world is slightly larger than the stage — so edge % look “stuck to walls”.
 */
export function buildConstellation(
  lights: Light[],
  layout: 'top' | 'full' = 'full',
): ConstellationNode[] {
  const sorted = [...lights].sort((a, b) => b.daysAgo - a.daysAgo)
  const n = sorted.length
  const world = getConstellationWorldScale(n)

  // Horizontal breathing room (percent of world). Tighter when few Lights.
  const edgeX = n <= 2 ? 34 : n <= 4 ? 30 : n <= 8 ? 26 : 22
  const spanX = 100 - edgeX * 2

  return sorted.map((light, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1)
    // One Light sits in open air — room for glow, date, and whisper.
    const xAlone = 50 + (seedFromId(light.id, 3.7) - 0.5) * 5
    const yAlone = 44 + (seedFromId(light.id, 9.1) - 0.5) * 8

    // Gentle meander — stay inside the soft frame, wander opens the world.
    const waves = 1 + Math.min(2.2, Math.max(0, n - 2) * 0.16)
    const amp = layout === 'top' ? 10 + Math.min(12, Math.max(0, n - 2) * 1.0) : 14
    const jitter = n > 8 ? 5 : 3.5
    const spanY = world.y > 1.5 ? 18 : 20

    const x =
      n === 1
        ? xAlone
        : edgeX + t * spanX + (seedFromId(light.id, 3.7) - 0.5) * jitter
    const y =
      n === 1
        ? yAlone
        : layout === 'top'
          ? 26 + Math.sin(t * Math.PI * waves) * amp + t * spanY +
            (seedFromId(light.id, 9.1) - 0.5) * jitter
          : 28 + Math.sin(t * Math.PI) * 14 + t * 28 + (seedFromId(light.id, 9.1) - 0.5) * 8

    const recency = Math.max(0.45, 1 - light.daysAgo / 120)
    const size = 7.5 + recency * 3.8
    // Melodic desync — wide tempo range + phase offset (not a choir)
    const twinkleDuration = 2.8 + seedFromId(light.id, 7.2) * 7.4
    const twinkleDelay = seedFromId(light.id, 2.1) * twinkleDuration

    return {
      light,
      x: Math.min(100 - edgeX, Math.max(edgeX, x)),
      y: Math.min(72, Math.max(32, y)),
      size,
      twinkleDuration,
      twinkleDelay,
    }
  })
}

export { getConstellationWorldScale }

/** Hairline threads between adjacent Lights only — a breath, not a mesh. */
export function ConstellationLines({
  nodes,
  activeId = null,
}: {
  nodes: ConstellationNode[]
  activeId?: string | null
}) {
  if (nodes.length < 2) return null

  const activeIndex = activeId ? nodes.findIndex((n) => n.light.id === activeId) : -1

  return (
    <svg
      className="vora-constellation-lines pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {nodes.slice(0, -1).map((node, i) => {
        const next = nodes[i + 1]
        const lit =
          activeIndex >= 0 && (i === activeIndex || i + 1 === activeIndex || i === activeIndex - 1)
        return (
          <line
            key={`${node.light.id}-${next.light.id}`}
            className={
              lit ? 'vora-constellation-line vora-constellation-line--lit' : 'vora-constellation-line'
            }
            x1={node.x}
            y1={node.y}
            x2={next.x}
            y2={next.y}
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
    </svg>
  )
}

'use client'

import { useMemo } from 'react'

type Mote = {
  top: number
  left: number
  size: number
  opacity: number
  delay: number
  duration: number
}

function MirrorMotes({ count = 8 }: { count?: number }) {
  const motes = useMemo<Mote[]>(() => {
    const out: Mote[] = []
    for (let i = 0; i < count; i++) {
      const r = (n: number) => {
        const x = Math.sin((i + 1) * n) * 10000
        return x - Math.floor(x)
      }
      out.push({
        top: r(12.9898) * 100,
        left: r(78.233) * 100,
        size: 0.75 + r(3.14) * 0.8,
        opacity: 0.12 + r(2.2) * 0.28,
        delay: r(4.1) * 14,
        duration: 9 + r(9.7) * 10,
      })
    }
    return out
  }, [count])

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {motes.map((m, i) => (
        <span
          key={i}
          className="vora-mirror-mote"
          style={{
            top: `${m.top}%`,
            left: `${m.left}%`,
            width: m.size,
            height: m.size,
            opacity: m.opacity,
            animation: `vora-mirror-mote ${m.duration}s ease-in-out ${m.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/** Soft lavender mirror — atmosphere only, typography stays hero. */
function MirrorCelestialLayers() {
  return (
    <>
      <div className="vora-mirror-dream-base" />
      <div className="vora-mirror-dream-glow" aria-hidden="true" />
      <div className="vora-mirror-dream-mist vora-mirror-drift vora-mirror-drift--a" aria-hidden="true" />
      <div className="vora-mirror-dream-mist vora-mirror-drift vora-mirror-drift--d" aria-hidden="true" />
      <div className="vora-mirror-dream-floor" aria-hidden="true" />
      <MirrorMotes />
    </>
  )
}

export function MirrorAtmosphere({
  className = '',
  variant = 'celestial',
}: {
  className?: string
  variant?: 'morning' | 'night' | 'celestial'
}) {
  if (variant === 'celestial') {
    return (
      <div
        className={`vora-mirror-atmosphere vora-mirror-atmosphere--celestial ${className}`}
        aria-hidden="true"
      >
        <MirrorCelestialLayers />
      </div>
    )
  }

  const night = variant === 'night'

  return (
    <div
      className={`vora-mirror-atmosphere ${night ? 'vora-mirror-atmosphere--night' : ''} ${className}`}
      aria-hidden="true"
    >
      <div className="vora-mirror-gradient" />
      {night && <div className="vora-mirror-night-glow" />}
      {night && <div className="vora-mirror-floor-light" aria-hidden="true" />}
      {night && <div className="vora-mirror-night-stars" aria-hidden="true" />}
      <div className="vora-mirror-drift vora-mirror-drift--a" />
      <div className="vora-mirror-drift vora-mirror-drift--d" />
      {!night && <MirrorMotes />}
    </div>
  )
}

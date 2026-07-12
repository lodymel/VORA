'use client'

import { useMemo } from 'react'

type Star = {
  top: string
  left: string
  size: number
  delay: string
  duration: string
  opacity: number
}

// A calm, sparse field of soft light motes — thematic, never busy.
// Sits on the aurora wash and stays close to invisible.
export function Starfield({ count = 26, className = '' }: { count?: number; className?: string }) {
  const stars = useMemo<Star[]>(() => {
    const seeded: Star[] = []
    for (let i = 0; i < count; i++) {
      // deterministic pseudo-random from index to avoid hydration drift
      const r = (n: number) => {
        const x = Math.sin((i + 1) * n) * 10000
        return x - Math.floor(x)
      }
      seeded.push({
        top: `${(r(12.9898) * 100).toFixed(2)}%`,
        left: `${(r(78.233) * 100).toFixed(2)}%`,
        size: r(3.14) > 0.85 ? 3.5 : 2.5,
        delay: `${(r(4.1) * 8).toFixed(2)}s`,
        duration: `${(6 + r(9.7) * 6).toFixed(2)}s`,
        opacity: 0.1 + r(2.2) * 0.2,
      })
    }
    return seeded
  }, [count])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="vora-aurora absolute inset-0" />
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-vora-violet/30 blur-[1px]"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `vora-twinkle ${s.duration} ease-in-out ${s.delay} infinite`,
          }}
        />
      ))}
    </div>
  )
}

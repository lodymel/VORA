'use client'

import { useMemo } from 'react'

type DustStar = {
  top: number
  left: number
  size: number
  opacity: number
  delay: number
  duration: number
  floatX: number
  floatY: number
}

/** Decorative pinprick stars — ambient sky, not the user's Lights. */
export function SkyDust({
  count = 48,
  layer = 'far',
}: {
  count?: number
  layer?: 'far' | 'near'
}) {
  const stars = useMemo<DustStar[]>(() => {
    const out: DustStar[] = []
    const layerSeed = layer === 'near' ? 17 : 1
    for (let i = 0; i < count; i++) {
      const r = (n: number) => {
        const x = Math.sin((i + 1) * n * layerSeed) * 10000
        return x - Math.floor(x)
      }
      const near = layer === 'near'
      const reach = near ? 18 : 12
      out.push({
        top: r(12.9898) * 100,
        left: r(78.233) * 100,
        size: near ? (r(3.14) > 0.8 ? 2.4 : 1.6) : r(3.14) > 0.88 ? 1.8 : 1.2,
        opacity: near ? 0.16 + r(2.2) * 0.28 : 0.1 + r(2.2) * 0.22,
        delay: r(4.1) * 6,
        duration: (near ? 5.5 : 7.5) + r(9.7) * 5,
        floatX: (r(5.5) - 0.5) * reach,
        floatY: (r(8.2) - 0.5) * reach * 0.9,
      })
    }
    return out
  }, [count, layer])

  return (
    <div
      className={`vora-sky-dust vora-sky-dust--${layer} pointer-events-none absolute inset-0`}
      aria-hidden="true"
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="vora-sky-dust-star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            ['--dust-dx' as string]: `${s.floatX}px`,
            ['--dust-dy' as string]: `${s.floatY}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

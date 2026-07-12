'use client'

import { SkyDust } from './sky-dust'
import { useSkyParallax } from './use-sky-parallax'

/** Purple night sky — living atmosphere with visible quiet motion. */
export function SkyAtmosphere({
  className = '',
  depth = 'sky',
  intensify = false,
  explore = { x: 0, y: 0 },
}: {
  className?: string
  depth?: 'gate' | 'sky' | 'deep'
  intensify?: boolean
  /** Extra depth from constellation explore pan — graphic parallax, not color. */
  explore?: { x: number; y: number }
}) {
  const alive = depth !== 'gate'
  const parallax = useSkyParallax(alive, depth === 'deep' ? 1.2 : 1)
  const far = depth === 'gate' ? 48 : depth === 'deep' ? 58 : 52
  const near = depth === 'gate' ? 14 : depth === 'deep' ? 20 : 16

  const ex = explore.x
  const ey = explore.y

  return (
    <div
      className={`vora-sky-atmosphere ${intensify ? 'vora-sky-atmosphere--intensify' : ''} ${
        depth === 'gate' ? 'vora-sky-atmosphere--gate' : 'vora-sky-atmosphere--alive'
      } ${className}`}
      aria-hidden="true"
    >
      <div className="vora-sky-gradient" />
      <div className="vora-sky-horizon-breath" />
      <div
        className="vora-sky-aurora-track"
        style={{ transform: `translate3d(${ex * 0.14}px, ${ey * 0.1}px, 0)` }}
      >
        <div className="vora-sky-aurora" />
      </div>
      <div className="vora-sky-color-shift" />
      <div className="vora-sky-color-shift vora-sky-color-shift--b" />
      <div
        className="vora-sky-veil-track"
        style={{ transform: `translate3d(${ex * 0.07}px, ${ey * 0.05}px, 0)` }}
      >
        <div className="vora-sky-veil" />
      </div>

      <div
        className="vora-sky-layer vora-sky-layer--far"
        style={{
          transform: `translate3d(${parallax.x * 0.35 + ex * 0.18}px, ${parallax.y * 0.35 + ey * 0.18}px, 0)`,
        }}
      >
        <SkyDust count={far} layer="far" />
      </div>

      <div
        className="vora-sky-layer vora-sky-layer--mid"
        style={{
          transform: `translate3d(${parallax.x * 0.75 + ex * 0.42}px, ${parallax.y * 0.75 + ey * 0.42}px, 0)`,
        }}
      >
        <div className="vora-sky-drift vora-sky-drift--a" />
        <div className="vora-sky-drift vora-sky-drift--b" />
        <div className="vora-sky-drift vora-sky-drift--c" />
      </div>

      <div
        className="vora-sky-layer vora-sky-layer--near"
        style={{
          transform: `translate3d(${parallax.x * 1.25 + ex * 0.72}px, ${parallax.y * 1.25 + ey * 0.72}px, 0)`,
        }}
      >
        <div className="vora-sky-drift vora-sky-drift--d" />
        <SkyDust count={near} layer="near" />
      </div>
    </div>
  )
}

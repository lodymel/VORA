'use client'

import { VoraOStar } from './logo'

/** Constellation point — VORA’s O-star, each with its own breath tempo. */
export function ConstellationStar({
  size = 10,
  active = false,
  twinkleDuration = 5,
  twinkleDelay = 0,
}: {
  size?: number
  active?: boolean
  twinkleDuration?: number
  twinkleDelay?: number
}) {
  // Soft seat — breath lives in the glow animation.
  const glyph = Math.max(8, Math.round(size * 1.5))

  return (
    <span
      className={`vora-constellation-star ${
        active ? 'vora-constellation-star--active' : 'vora-constellation-star--twinkle'
      }`}
      style={
        active
          ? { width: glyph, height: glyph }
          : {
              width: glyph,
              height: glyph,
              // Negative delay = already mid-phrase on first paint (true desync)
              ['--twinkle-dur' as string]: `${twinkleDuration}s`,
              ['--twinkle-delay' as string]: `${-twinkleDelay}s`,
            }
      }
      aria-hidden="true"
    >
      <VoraOStar size={glyph} className="vora-constellation-star-glyph" />
    </span>
  )
}

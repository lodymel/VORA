'use client'

import { useId } from 'react'

type WordmarkSize = 'header' | 'sm' | 'md' | 'lg'
type WordmarkTone = 'night' | 'light'

/** VORA wordmark — official serif logo asset. */
export function VoraWordmark({
  size = 'md',
  tone = 'night',
  className = '',
}: {
  size?: WordmarkSize
  tone?: WordmarkTone
  className?: string
}) {
  return (
    <span
      className={`vora-wordmark vora-wordmark--${size} vora-wordmark--${tone} ${className}`.trim()}
      aria-label="VORA"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/vora-logo.png"
        alt=""
        className="vora-wordmark-img"
        draggable={false}
      />
    </span>
  )
}

/** Four-pointed sparkle from inside the VORA “O”. */
export function VoraOStar({
  size = 28,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const glow = `vora-o-star-glow-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={`vora-o-star ${className}`.trim()}
    >
      <defs>
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--vora-o-star-glow-0, rgb(255 255 255 / 95%))" />
          <stop offset="45%" stopColor="var(--vora-o-star-glow-1, rgb(228 217 255 / 55%))" />
          <stop offset="100%" stopColor="var(--vora-o-star-glow-2, rgb(203 184 255 / 0%))" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="18" fill={`url(#${glow})`} />
      <path
        d="M24 8 C24.55 15.2 32.8 23.45 40 24 C32.8 24.55 24.55 32.8 24 40 C23.45 32.8 15.2 24.55 8 24 C15.2 23.45 23.45 15.2 24 8 Z"
        fill="var(--vora-o-star-core, rgb(255 252 250 / 96%))"
      />
    </svg>
  )
}

/** Compact mark — O-star symbol. */
export function VoraMark({ size = 44, className = '' }: { size?: number; className?: string }) {
  return <VoraOStar size={size} className={`vora-mark ${className}`.trim()} />
}

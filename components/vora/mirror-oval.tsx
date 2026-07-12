'use client'

import type { KeyboardEvent, ReactNode } from 'react'
import { MirrorAuroraBloom } from './mirror-aurora-bloom'

/** Mysterious violet glass mirror — reflects the headline, tap to hold Light. */
export function MirrorOval({
  bright = false,
  listening = false,
  creating = false,
  creatingStep = 0,
  orbitalsAwakened = false,
  saved = false,
  portal = false,
  saveStar = false,
  tappable = false,
  tapDisabled = false,
  onTap,
  children,
}: {
  bright?: boolean
  listening?: boolean
  creating?: boolean
  creatingStep?: number
  orbitalsAwakened?: boolean
  saved?: boolean
  /** Glass portal — tap surface; light & depth only, no duplicate text. */
  portal?: boolean
  saveStar?: boolean
  tappable?: boolean
  tapDisabled?: boolean
  onTap?: () => void
  children?: ReactNode
}) {
  const orbitalsActive =
    orbitalsAwakened || listening || (creating && creatingStep >= 1)

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!tappable || tapDisabled || !onTap) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onTap()
    }
  }

  return (
    <div
      className={`vora-mirror-oval ${portal ? 'vora-mirror-oval--portal' : ''} ${
        bright ? 'vora-mirror-oval--bright' : ''
      } ${saved ? 'vora-mirror-oval--saved' : ''} ${listening ? 'vora-mirror-oval--listening' : ''} ${
        creating ? 'vora-mirror-oval--creating' : ''
      } ${creatingStep >= 2 ? 'vora-mirror-oval--creating-dense' : ''} ${
        creatingStep >= 4 ? 'vora-mirror-oval--creating-ascend' : ''
      } ${tappable ? 'vora-mirror-oval--tappable' : ''} ${
        tappable && tapDisabled ? 'vora-mirror-oval--tap-disabled' : ''
      }`}
      role={tappable ? 'button' : undefined}
      tabIndex={tappable && !tapDisabled ? 0 : undefined}
      aria-disabled={tappable && tapDisabled ? true : undefined}
      aria-label={tappable ? 'Save this Light to your Sky' : undefined}
      onClick={tappable && !tapDisabled ? onTap : undefined}
      onKeyDown={handleKeyDown}
    >
      {orbitalsActive ? (
        <MirrorAuroraBloom
          awakened={orbitalsActive}
          dense={creating && creatingStep >= 2}
        />
      ) : null}

      <span className="vora-mirror-oval-aura" aria-hidden="true" />

      <div className="vora-mirror-oval-glass">
        <span className="vora-mirror-oval-mist" aria-hidden="true" />
        <span className="vora-mirror-oval-depth" aria-hidden="true" />
        <span className="vora-mirror-oval-reflect" aria-hidden="true" />
        <span className="vora-mirror-oval-sheen" aria-hidden="true" />
        {children ? <div className="vora-mirror-oval-content">{children}</div> : null}
      </div>
      {saveStar ? <span className="vora-mirror-save-star" aria-hidden="true" /> : null}
    </div>
  )
}

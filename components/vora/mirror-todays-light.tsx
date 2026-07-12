'use client'

import type { KeyboardEvent } from 'react'
import { AlbumTypoBlock } from './album-typo-block'
import type { AlbumTypoLines } from './mirror-album-typo'
import { getAlbumTypoLines } from './mirror-album-typo'

export { getAlbumTypoLines }
export type { AlbumTypoLines }

/** Editorial poster — Instrument + Rosemartin at matched scale. */
export function MirrorTodaysLight({
  sentence,
  lines: linesProp,
  tappable = false,
  tapDisabled = false,
  glowing = false,
  saveStar = false,
  onTap,
}: {
  sentence?: string
  lines?: AlbumTypoLines
  tappable?: boolean
  tapDisabled?: boolean
  glowing?: boolean
  saveStar?: boolean
  onTap?: () => void
}) {
  const lines = linesProp ?? getAlbumTypoLines(sentence ?? '')

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!tappable || tapDisabled || !onTap) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onTap()
    }
  }

  return (
    <div
      className={`vora-mirror-headline ${glowing ? 'vora-mirror-headline--glow' : ''} ${
        tappable ? 'vora-mirror-headline--tappable' : ''
      } ${tappable && tapDisabled ? 'vora-mirror-headline--disabled' : ''}`}
      role={tappable ? 'button' : undefined}
      tabIndex={tappable && !tapDisabled ? 0 : undefined}
      aria-disabled={tappable && tapDisabled ? true : undefined}
      aria-label={tappable ? 'Hold this Light to your Sky' : undefined}
      onClick={
        tappable && !tapDisabled
          ? () => {
              onTap?.()
            }
          : undefined
      }
      onKeyDown={handleKeyDown}
    >
      <AlbumTypoBlock lines={lines} tone="sky" as="h1" />
      {saveStar ? <span className="vora-mirror-save-star vora-mirror-save-star--title" aria-hidden="true" /> : null}
    </div>
  )
}

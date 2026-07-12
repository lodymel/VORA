'use client'

import type { ReactNode } from 'react'
import { CursorStarTrail, type CursorSurface } from './cursor-star-trail'
import { DEFAULT_SKY_THEME, type SkyThemeId } from './light-card-theme'

/**
 * Adaptive app shell — full-bleed at every width; safe areas for mobile / native shell.
 * Safe areas respected for notched phones and native WebView.
 */
export function AppShell({
  children,
  ambient = false,
  skyTheme = DEFAULT_SKY_THEME,
  cursorSurface = 'sky',
}: {
  children: ReactNode
  ambient?: boolean
  skyTheme?: SkyThemeId
  /** Sky night glow vs Me morning ink — cursor palette follows the surface. */
  cursorSurface?: CursorSurface
}) {
  return (
    <div
      className={`vora-app-root ${ambient ? 'vora-app-root--ambient' : ''}`}
      data-sky-theme={skyTheme}
      data-vora-surface={cursorSurface}
    >
      <div className="vora-app-canvas">
        {children}
        {/* Inside canvas host — never a flex sibling of the app surface */}
        <CursorStarTrail surface={cursorSurface} skyTheme={skyTheme} />
      </div>
    </div>
  )
}

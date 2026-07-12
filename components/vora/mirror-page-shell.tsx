'use client'

import type { ReactNode } from 'react'
import { MirrorAtmosphere } from './mirror-atmosphere'

const DATE_STAMP = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
}).format(new Date())

export function MirrorPageShell({
  children,
  footer,
  className = '',
  mainClassName = '',
  showHeader = true,
  atmosphere = 'celestial',
}: {
  children: ReactNode
  footer?: ReactNode
  className?: string
  mainClassName?: string
  showHeader?: boolean
  atmosphere?: 'celestial' | 'night'
}) {
  const shellTone =
    atmosphere === 'night' ? 'vora-mirror-shell--night' : 'vora-mirror-shell--celestial'

  return (
    <div
      className={`vora-mirror-shell ${shellTone} relative flex h-full w-full flex-col overflow-hidden pb-28 ${className}`}
    >
      <MirrorAtmosphere variant={atmosphere} className="absolute inset-0" />

      <div className="vora-mirror-page relative z-10 flex min-h-0 w-full flex-1 flex-col px-7">
        <div className="vora-mirror-poster flex min-h-0 flex-1 flex-col items-center justify-center">
          <div className="vora-mirror-poster-stack">
            {showHeader && (
              <header className="vora-mirror-page-heading w-full text-center">
                <p className="vora-mirror-kicker">
                  <span className="vora-mirror-kicker-index">01</span>
                  <span className="vora-mirror-kicker-sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="vora-mirror-kicker-label">Today&apos;s Light</span>
                  <span className="vora-mirror-kicker-sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="vora-mirror-kicker-date">{DATE_STAMP}</span>
                </p>
              </header>
            )}

            <div className={`vora-mirror-shell-main w-full ${mainClassName}`.trim()}>
              {children}
            </div>
          </div>
        </div>

        {footer ? <footer className="vora-mirror-footer-slot">{footer}</footer> : null}
      </div>
    </div>
  )
}

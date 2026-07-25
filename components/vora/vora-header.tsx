'use client'

import { useState, type ReactNode } from 'react'
import { VoraWordmark } from './logo'

/** Persistent top brand chrome — Sky, Me. */
export function VoraHeader({
  tone = 'night',
  trailing,
  onHome,
}: {
  tone?: 'night' | 'light'
  trailing?: ReactNode
  onHome?: () => void
}) {
  const [homeAck, setHomeAck] = useState(false)

  function handleHome() {
    onHome?.()
    setHomeAck(true)
    window.setTimeout(() => setHomeAck(false), 420)
  }

  return (
    <header className={`vora-app-header ${trailing ? 'vora-app-header--split' : ''}`}>
      {onHome ? (
        <button
          type="button"
          onClick={handleHome}
          className={`vora-app-header-brand vora-app-header-home${
            homeAck ? ' vora-app-header-home--ack' : ''
          }`}
          aria-label="VORA home"
        >
          <VoraWordmark size="header" tone={tone} />
        </button>
      ) : (
        <div className="vora-app-header-brand">
          <VoraWordmark size="header" tone={tone} />
        </div>
      )}
      {trailing ? <div className="vora-app-header-trailing">{trailing}</div> : null}
    </header>
  )
}

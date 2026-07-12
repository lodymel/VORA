'use client'

import type { ReactNode } from 'react'

/** Stable mirror layout — poster headline, optional write-flow oval, pedestal. */
export function MirrorStage({
  headline,
  mirror,
  mic,
  micCaption = null,
  pedestal,
  secondary,
  secondaryClassName = '',
  tapHint,
  tapHintSaved = false,
}: {
  headline?: ReactNode
  mirror?: ReactNode
  mic?: ReactNode
  micCaption?: string | null
  pedestal?: ReactNode
  secondary?: ReactNode
  secondaryClassName?: string
  tapHint?: string | null
  tapHintSaved?: boolean
}) {
  const showFloorGlow = Boolean(pedestal || mic)

  return (
    <div className="vora-mirror-stage">
      <div className="vora-mirror-stage-hero">
        {headline ? <div className="vora-mirror-stage-headline">{headline}</div> : null}
        {mirror ? <div className="vora-mirror-stage-mirror">{mirror}</div> : null}
      </div>

      {showFloorGlow ? (
        <div className="vora-mirror-pedestal-stack" aria-hidden="true">
          <span className="vora-mirror-pedestal">
            <span className="vora-mirror-pedestal-glow" />
          </span>
        </div>
      ) : null}

      {tapHint ? (
        <p
          className={`vora-mirror-tap-hint ${tapHintSaved ? 'vora-mirror-tap-hint--saved' : ''}`}
          aria-live="polite"
        >
          {tapHint}
        </p>
      ) : null}

      {pedestal ? (
        <div className="vora-mirror-pedestal-content">{pedestal}</div>
      ) : mic ? (
        <div className="vora-mirror-mic-block">
          <div className="vora-mirror-mic-on-pedestal">{mic}</div>
          {micCaption ? <p className="vora-mirror-mic-caption">{micCaption}</p> : null}
        </div>
      ) : null}

      {secondary ? (
        <div
          className={`vora-mirror-secondary ${secondaryClassName}`.trim()}
          aria-hidden={!secondary}
        >
          {secondary}
        </div>
      ) : null}
    </div>
  )
}

'use client'

/** Write flow actions — same pedestal slot as Mirror idle Save / Write buttons. */
export function WriteLightPedestal({
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  onSecondary,
  secondaryLabel = 'Step back',
  links,
}: {
  primaryLabel: string
  onPrimary: () => void
  primaryDisabled?: boolean
  onSecondary: () => void
  secondaryLabel?: string
  links?: { label: string; onClick: () => void }[]
}) {
  return (
    <div className="vora-mirror-write-pedestal">
      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className="vora-pill vora-pill--mirror vora-mirror-light-actions-primary"
      >
        {primaryLabel}
      </button>
      {links && links.length > 0 ? (
        <div className="vora-mirror-write-links">
          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={link.onClick}
              className="vora-text-link vora-text-link--night py-1"
            >
              {link.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={onSecondary}
          className="vora-pill vora-pill--mirror vora-pill--mirror-outline vora-mirror-light-actions-secondary"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  )
}

/** Invisible spacer — keeps oval position fixed when pedestal has no actions. */
export function MirrorPedestalSpacer() {
  return <div className="vora-mirror-pedestal-spacer" aria-hidden="true" />
}

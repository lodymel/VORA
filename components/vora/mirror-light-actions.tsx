'use client'

/** Idle mirror secondary — text link; stays mounted so layout never jumps. */
export function MirrorLightActions({
  onWrite,
  dimmed = false,
}: {
  onWrite: () => void
  dimmed?: boolean
}) {
  return (
    <div className={`vora-mirror-light-actions ${dimmed ? 'vora-mirror-light-actions--dimmed' : ''}`}>
      <button type="button" onClick={onWrite} className="vora-mirror-text-link">
        Write my own Light
      </button>
    </div>
  )
}

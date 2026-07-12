'use client'

/** Soft violet watercolor bloom behind the mirror — no hard ring strokes. */
export function MirrorAuroraBloom({
  awakened = false,
  dense = false,
}: {
  awakened?: boolean
  dense?: boolean
}) {
  return (
    <div
      className={`vora-mirror-aurora ${awakened ? 'vora-mirror-aurora--awakened' : ''} ${
        dense ? 'vora-mirror-aurora--dense' : ''
      }`}
      aria-hidden="true"
    >
      <span className="vora-mirror-aurora-wash vora-mirror-aurora-wash--core" />
      <span className="vora-mirror-aurora-wash vora-mirror-aurora-wash--a" />
      <span className="vora-mirror-aurora-wash vora-mirror-aurora-wash--b" />
      <span className="vora-mirror-aurora-mist" />
      <span className="vora-mirror-aurora-stardust" />
    </div>
  )
}

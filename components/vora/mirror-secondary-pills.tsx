'use client'

/** Shared secondary row — keeps mirror layout stable across idle and capture. */
export function MirrorSecondaryPills({
  onExamples,
  onPrompt,
}: {
  onExamples?: () => void
  onPrompt?: () => void
}) {
  return (
    <>
      <button type="button" onClick={onExamples} className="vora-mirror-secondary-pill">
        Inspiration
      </button>
      <button type="button" onClick={onPrompt} className="vora-mirror-secondary-pill">
        Give me a spark
      </button>
      <span className="vora-mirror-secondary-pill vora-mirror-secondary-pill--muted">Save for later</span>
    </>
  )
}

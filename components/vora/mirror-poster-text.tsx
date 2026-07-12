'use client'

/** Spark prompt — title + optional subtitle inside the mirror. */
export function MirrorPosterText({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="vora-mirror-poster">
      <p className="vora-mirror-voice vora-mirror-voice--spark text-balance">{title}</p>
      {subtitle && <p className="vora-mirror-spark-sub text-balance">{subtitle}</p>}
    </div>
  )
}

'use client'

import { Pencil } from 'lucide-react'
import { reflectionNeedsReadMore } from './distill-reflection'

export function MirrorReflectionView({
  text,
  onReadMore,
  onEdit,
}: {
  text: string
  onReadMore?: () => void
  onEdit?: () => void
}) {
  const clamped = reflectionNeedsReadMore(text)

  return (
    <div className="vora-mirror-reflection-wrap">
      <p
        className={`vora-mirror-voice vora-mirror-voice--reflection text-balance ${
          clamped ? 'vora-mirror-voice--clamped' : ''
        }`}
      >
        {text}
      </p>
      {clamped && onReadMore && (
        <button type="button" onClick={onReadMore} className="vora-mirror-read-more">
          Read more
        </button>
      )}
      {onEdit && (
        <button type="button" onClick={onEdit} className="vora-mirror-edit-btn" aria-label="Edit reflection">
          <Pencil size={13} strokeWidth={1.5} />
          <span>Edit if you want</span>
        </button>
      )}
    </div>
  )
}

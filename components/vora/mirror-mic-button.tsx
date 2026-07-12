'use client'

import { Mic } from 'lucide-react'

export function MirrorMicButton({
  onClick,
  label,
  listening = false,
  passive = false,
}: {
  onClick?: () => void
  label: string
  listening?: boolean
  passive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={passive}
      aria-label={label}
      aria-pressed={listening || undefined}
      className={`vora-mirror-mic border-0 bg-transparent p-0 ${
        listening ? 'vora-mirror-mic--listening' : ''
      } ${passive ? 'vora-mirror-mic--passive' : ''}`}
    >
      {listening && (
        <>
          <span className="vora-mirror-mic-ripple vora-mirror-mic-ripple--a" aria-hidden="true" />
          <span className="vora-mirror-mic-ripple vora-mirror-mic-ripple--b" aria-hidden="true" />
          <span className="vora-mirror-mic-ripple vora-mirror-mic-ripple--c" aria-hidden="true" />
        </>
      )}
      <span className="vora-mirror-mic-glow vora-breathe" aria-hidden="true" />
      <span className="vora-mirror-mic-ring">
        <Mic size={20} strokeWidth={1.15} />
      </span>
    </button>
  )
}

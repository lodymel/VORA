'use client'

export function MirrorWaveform() {
  return (
    <div className="vora-mirror-waveform" aria-hidden="true">
      <div className="vora-mirror-waveform-bars">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="vora-mirror-waveform-bar"
            style={{ animationDelay: `${(i % 7) * 0.09}s` }}
          />
        ))}
      </div>
      <p className="vora-mirror-listening-label">
        Listening
        <span className="vora-mirror-dots" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  )
}

'use client'

export function MirrorLightStar({
  intense = false,
  emerging = false,
}: {
  intense?: boolean
  emerging?: boolean
}) {
  return (
    <span
      className={`vora-mirror-light-star ${intense ? 'vora-mirror-light-star--intense' : ''} ${
        emerging ? 'vora-mirror-light-star--emerging' : ''
      }`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M24 4L27.2 18.8L42 22L27.2 25.2L24 40L20.8 25.2L6 22L20.8 18.8L24 4Z"
          fill="url(#vora-star-fill)"
        />
        <defs>
          <radialGradient id="vora-star-fill" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FFF6F1" />
            <stop offset="100%" stopColor="#CBB8FF" />
          </radialGradient>
        </defs>
      </svg>
    </span>
  )
}

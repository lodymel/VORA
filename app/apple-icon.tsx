import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Home-screen icon — indigo → soft-purple sky tile + VORA O-star. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #12183a 0%, #2a2758 42%, #5a4a9a 72%, #8171c9 100%)',
          borderRadius: 40,
        }}
      >
        <svg
          width="126"
          height="126"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 8 C24.55 15.2 32.8 23.45 40 24 C32.8 24.55 24.55 32.8 24 40 C23.45 32.8 15.2 24.55 8 24 C15.2 23.45 23.45 15.2 24 8 Z"
            fill="#fffaf7"
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}

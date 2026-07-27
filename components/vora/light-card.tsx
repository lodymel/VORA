'use client'

import { forwardRef, useMemo } from 'react'
import { AlbumTypoBlock } from './album-typo-block'
import { getAlbumTypoLines } from './mirror-album-typo'
import { formatSkyDate } from './sky-date'
import { DEFAULT_LIGHT_CARD_THEME, type LightCardThemeId } from './light-card-theme'
import { VoraOStar, VoraWordmark } from './logo'
import type { Light } from './constants'
import { useVoraLocale } from './vora-locale'

const DUST = [
  { left: '15%', top: '17%', size: 1.6, delay: '0s', duration: '6.8s' },
  { left: '79%', top: '14%', size: 1.35, delay: '1.4s', duration: '7.4s' },
  { left: '23%', top: '41%', size: 1.25, delay: '2.8s', duration: '7s' },
  { left: '83%', top: '47%', size: 1.5, delay: '0.9s', duration: '7.8s' },
  { left: '17%', top: '73%', size: 1.3, delay: '2.1s', duration: '6.6s' },
  { left: '71%', top: '77%', size: 1.4, delay: '3.6s', duration: '7.2s' },
] as const

/**
 * Light card — quiet craft: one feeling, soft object, typography first.
 * Quiet constellation dust as the single atmospheric point.
 */
export const LightCard = forwardRef<
  HTMLElement,
  {
    light: Light
    theme?: LightCardThemeId
    className?: string
    size?: 'screen' | 'export'
  }
>(function LightCard(
  { light, theme = DEFAULT_LIGHT_CARD_THEME, className = '', size = 'screen' },
  ref,
) {
  const { locale } = useVoraLocale()
  const dateStamp = useMemo(() => formatSkyDate(light, locale), [light, locale])
  const lines = useMemo(() => getAlbumTypoLines(light.sentence), [light.sentence])
  const starSize = size === 'export' ? 72 : 22
  const dustScale = size === 'export' ? 3.4 : 1
  const hangulCard = locale === 'ko' || /[\uAC00-\uD7A3]/.test(light.sentence)

  return (
    <article
      ref={ref}
      className={`vora-light-card vora-light-card--${size}${hangulCard ? ' vora-lang-ko' : ''} ${className}`.trim()}
      data-theme={theme}
      aria-label={`Light card: ${light.sentence}`}
    >
      <div className="vora-light-card-wash" aria-hidden="true" />
      <div className="vora-light-card-glow" aria-hidden="true" />
      <div className="vora-light-card-dust" aria-hidden="true">
        {DUST.map((star, i) => (
          <span
            key={i}
            className="vora-light-card-dust-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size * dustScale,
              height: star.size * dustScale,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>
      <div className="vora-light-card-grain" aria-hidden="true" />
      <div className="vora-light-card-edge" aria-hidden="true" />

      <div className="vora-light-card-inner">
        <header className="vora-light-card-date">
          {dateStamp.weekday} · {dateStamp.date}
        </header>

        <div className="vora-light-card-body">
          <span className="vora-light-card-spark" aria-hidden="true">
            <VoraOStar size={starSize} />
          </span>
          <AlbumTypoBlock lines={lines} tone="card" as="h2" />
        </div>

        <footer className="vora-light-card-mark">
          <VoraWordmark size="sm" tone="night" className="vora-light-card-wordmark" />
        </footer>
      </div>
    </article>
  )
})

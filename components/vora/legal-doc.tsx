import Link from 'next/link'
import { VoraWordmark } from './logo'
import { DEFAULT_SKY_THEME } from './light-card-theme'

/**
 * Play-ready Privacy / Terms.
 * Same composition as the in-app sheet: sky behind, policy sheet in front.
 */
export function LegalDoc({
  kicker,
  title,
  lede,
  updated,
  children,
}: {
  kicker: string
  title: string
  lede: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <main className="vora-legal-stage" data-sky-theme={DEFAULT_SKY_THEME}>
      <div className="vora-legal-stage-sky" aria-hidden="true" />

      <header className="vora-app-header">
        <Link href="/" className="vora-app-header-brand vora-app-header-home" aria-label="VORA home">
          <VoraWordmark size="header" tone="night" />
        </Link>
      </header>

      <div className="vora-enter-panel vora-legal-panel" role="dialog" aria-modal="true" aria-labelledby="vora-legal-title">
        <Link href="/" className="vora-enter-panel-scrim" aria-label="Back to VORA" />

        <div className="vora-enter-panel-dock">
          <aside className="vora-enter-panel-sheet">
            <div className="vora-enter-panel-wash" aria-hidden="true" />
            <div className="vora-enter-panel-glow" aria-hidden="true" />
            <div className="vora-enter-panel-dust" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="vora-enter-panel-grain" aria-hidden="true" />
            <div className="vora-enter-panel-edge" aria-hidden="true" />

            <div className="vora-enter-panel-top">
              <Link href="/" className="vora-enter-panel-close" aria-label="Close">
                <span aria-hidden="true">×</span>
              </Link>
            </div>

            <div className="vora-enter-panel-content">
              <div className="vora-enter-panel-policy">
                <p className="vora-enter-panel-kicker">{kicker}</p>
                <h1 id="vora-legal-title" className="vora-enter-panel-headline">
                  {title}
                </h1>
                <p className="vora-enter-panel-copy">{lede}</p>
                <p className="vora-enter-panel-updated">{updated}</p>
                <div className="vora-enter-panel-chapters">{children}</div>

                <nav className="vora-legal-sheet-meta" aria-label="Legal">
                  <Link href="/privacy/" className="vora-enter-meta-link vora-enter-meta-link--night">
                    Privacy
                  </Link>
                  <span className="vora-enter-meta-dot" aria-hidden="true">
                    ·
                  </span>
                  <Link href="/terms/" className="vora-enter-meta-link vora-enter-meta-link--night">
                    Terms
                  </Link>
                  <span className="vora-enter-meta-dot" aria-hidden="true">
                    ·
                  </span>
                  <Link href="/" className="vora-enter-meta-link vora-enter-meta-link--night">
                    Sky
                  </Link>
                </nav>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

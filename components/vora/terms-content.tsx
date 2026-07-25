/** Shared Terms of Use for the public page. Calm, plain legal English. */

export const TERMS_UPDATED = 'July 25, 2026'

export const TERMS_LEDE =
  'These Terms of Use govern your use of VORA, an app by LODY STUDIO. By using VORA, you agree to these Terms.'

export function TermsChapters({ whisperClassName }: { whisperClassName?: string }) {
  return (
    <>
      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            01
          </span>
          <h2 className="vora-legal-chapter-title">The service</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            VORA is a personal reflection app. You may write a short sentence that appears as a
            “Light” in your personal sky. VORA is not medical advice, therapy, counseling, or an
            emergency service.
          </p>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            02
          </span>
          <h2 className="vora-legal-chapter-title">Your content</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            You retain ownership of the text you write. You are responsible for that content and for
            anything you choose to share outside the app. You agree not to use VORA to store or share
            content that is illegal, harmful, infringing, or that you do not have the right to use.
          </p>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            03
          </span>
          <h2 className="vora-legal-chapter-title">License</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            Subject to these Terms, we grant you a personal, non-exclusive, non-transferable license
            to use VORA for your own personal use. You may not copy, reverse engineer, resell, or
            misuse the app, its software, or its brand assets except as allowed by law.
          </p>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            04
          </span>
          <h2 className="vora-legal-chapter-title">Subscriptions</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            Some features may be offered as paid subscriptions (VORA+) through an app store such as
            Google Play. Price, free trial length (if any), and renewal terms are shown in the store
            purchase flow before you confirm.
          </p>
          <ul className="vora-legal-list">
            <li>Subscriptions renew automatically unless you cancel in your store account settings</li>
            <li>If a free trial is offered, it converts to a paid plan unless cancelled before it ends</li>
            <li>Refunds are handled under the applicable store’s refund policies</li>
          </ul>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            05
          </span>
          <h2 className="vora-legal-chapter-title">Availability and data</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            We aim to provide a reliable experience, but VORA is provided “as is” and “as available,”
            to the extent permitted by law. Features may change. In the current version, Lights are
            stored on your device. If you clear storage, change devices, or uninstall before cloud
            sync exists, that local data may be lost and we may not be able to restore it.
          </p>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            06
          </span>
          <h2 className="vora-legal-chapter-title">Changes and contact</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            We may update these Terms. When we do, we will update the date at the top. Continued use
            of VORA after an update means you accept the revised Terms, to the extent permitted by
            law.
          </p>
          <p className={whisperClassName ?? 'vora-legal-whisper'}>
            Questions about these Terms: use the developer contact email on the VORA Google Play
            listing, or the contact method LODY STUDIO publishes for VORA.
          </p>
        </div>
      </section>
    </>
  )
}

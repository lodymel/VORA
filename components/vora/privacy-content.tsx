/** Shared Privacy Policy for sheet and public page. Calm, plain legal English. */

export const PRIVACY_UPDATED = 'July 25, 2026'

export const PRIVACY_LEDE =
  'VORA is provided by LODY STUDIO. This policy explains what information the app handles and how.'

export function PrivacyChapters({ whisperClassName }: { whisperClassName?: string }) {
  return (
    <>
      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            01
          </span>
          <h2 className="vora-legal-chapter-title">Who we are</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            VORA (“we”, “us”) is an app by LODY STUDIO. In the current version there is no VORA
            account and no cloud sync. The core experience runs on your device.
          </p>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            02
          </span>
          <h2 className="vora-legal-chapter-title">Information on your device</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            To make the app work, VORA stores data locally on your device (for example in app or
            browser storage), including:
          </p>
          <ul className="vora-legal-list">
            <li>Sentences you write (“Lights”)</li>
            <li>Sky theme and similar preferences</li>
            <li>Basic app state (such as whether you have entered the main experience)</li>
            <li>Subscription status once store billing is connected</li>
          </ul>
          <p>
            We do not operate a VORA login in this version. We do not upload your Lights to LODY
            STUDIO servers in this version. We do not sell your personal information. We do not show
            third-party ads in VORA.
          </p>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            03
          </span>
          <h2 className="vora-legal-chapter-title">Sharing and leaving the app</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            If you export, share, or save a Light card, that content leaves the app through your
            device’s share or save tools. You choose when that happens.
          </p>
          <p>
            You can remove locally stored data by clearing the app or site data, or by uninstalling
            VORA. Subscriptions purchased through Google Play (or another app store) are managed in
            your store account settings.
          </p>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            04
          </span>
          <h2 className="vora-legal-chapter-title">Payments</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            Paid features (VORA+) are intended to be processed by the platform store (for example
            Google Play). Payment card details are handled by the store and its payment partners, not
            entered into VORA directly.
          </p>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            05
          </span>
          <h2 className="vora-legal-chapter-title">Analytics</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            The website version of VORA may use privacy-focused analytics (such as Vercel Analytics)
            to measure aggregate traffic and technical performance. This is not used to read the
            content of your Lights. The Android app build may not include the same web analytics.
          </p>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            06
          </span>
          <h2 className="vora-legal-chapter-title">Children</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            VORA is not directed to children under 13. We do not knowingly collect personal
            information from children under 13. If you believe a child has provided personal
            information through VORA, contact us and we will take appropriate steps.
          </p>
        </div>
      </section>

      <section className="vora-legal-chapter">
        <header className="vora-legal-chapter-head">
          <span className="vora-legal-chapter-index" aria-hidden="true">
            07
          </span>
          <h2 className="vora-legal-chapter-title">Changes and contact</h2>
        </header>
        <div className="vora-legal-chapter-body">
          <p>
            We may update this Privacy Policy as VORA changes (for example if cloud sync is added).
            When we do, we will update the date at the top of this page.
          </p>
          <p className={whisperClassName ?? 'vora-legal-whisper'}>
            Privacy questions: use the developer contact email on the VORA Google Play listing, or
            the contact method LODY STUDIO publishes for VORA.
          </p>
        </div>
      </section>
    </>
  )
}

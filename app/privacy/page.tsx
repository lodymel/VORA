import type { Metadata } from 'next'
import { LegalDoc } from '@/components/vora/legal-doc'
import { PRIVACY_LEDE, PRIVACY_UPDATED, PrivacyChapters } from '@/components/vora/privacy-content'

export const metadata: Metadata = {
  title: 'Privacy · VORA',
  description: 'Your Lights stay with you. How VORA treats what you write.',
}

export default function PrivacyPage() {
  return (
    <LegalDoc
      kicker="Privacy"
      title="Privacy Policy"
      lede={PRIVACY_LEDE}
      updated={PRIVACY_UPDATED}
    >
      <PrivacyChapters />
    </LegalDoc>
  )
}

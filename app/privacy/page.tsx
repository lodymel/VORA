import type { Metadata } from 'next'
import { LegalPublicPage } from '@/components/vora/legal-public-page'

export const metadata: Metadata = {
  title: 'Privacy · VORA',
  description: 'Your Lights stay with you. How VORA treats what you write.',
}

export default function PrivacyPage() {
  return <LegalPublicPage kind="privacy" />
}

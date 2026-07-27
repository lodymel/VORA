import type { Metadata } from 'next'
import { LegalPublicPage } from '@/components/vora/legal-public-page'

export const metadata: Metadata = {
  title: 'Terms · VORA',
  description: 'Terms for using VORA, a calm place for one true sentence.',
}

export default function TermsPage() {
  return <LegalPublicPage kind="terms" />
}

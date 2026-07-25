import type { Metadata } from 'next'
import { LegalDoc } from '@/components/vora/legal-doc'
import { TERMS_LEDE, TERMS_UPDATED, TermsChapters } from '@/components/vora/terms-content'

export const metadata: Metadata = {
  title: 'Terms · VORA',
  description: 'Terms for using VORA, a calm place for one true sentence.',
}

export default function TermsPage() {
  return (
    <LegalDoc
      kicker="Terms"
      title="Terms of Use"
      lede={TERMS_LEDE}
      updated={TERMS_UPDATED}
    >
      <TermsChapters />
    </LegalDoc>
  )
}

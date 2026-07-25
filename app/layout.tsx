import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bodoni_Moda, Instrument_Serif, Jost, Pinyon_Script } from 'next/font/google'
import { rosemartin } from '@/lib/fonts/sky-reveal'
import { pretendard, satoshi } from '@/lib/fonts/ui'
import { VORA_META_DESCRIPTION, VORA_META_TITLE } from '@/components/vora/brand'
import '@/lib/fonts/gowun.css'
import './globals.css'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
})

const bodoniModa = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-bodoni',
})

const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pinyon',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jost',
})

export const metadata: Metadata = {
  title: VORA_META_TITLE,
  description: VORA_META_DESCRIPTION,
  generator: 'VORA',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VORA',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0c0616' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0616' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${rosemartin.variable} ${bodoniModa.variable} ${pinyonScript.variable} ${jost.variable} ${satoshi.variable} ${pretendard.variable}`}
    >
      <body className="bg-background font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bodoni_Moda, Instrument_Serif, Jost, Pinyon_Script } from 'next/font/google'
import { gowunBatang, gowunDodum } from '@/lib/fonts/korean'
import { rosemartin } from '@/lib/fonts/sky-reveal'
import { VORA_META_DESCRIPTION, VORA_META_TITLE } from '@/components/vora/brand'
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
      className={`${instrumentSerif.variable} ${rosemartin.variable} ${gowunBatang.variable} ${gowunDodum.variable} ${bodoniModa.variable} ${pinyonScript.variable} ${jost.variable}`}
    >
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap"
          rel="stylesheet"
        />
        {/*
          Hangul glyphs — next/font only subsets Latin; this CSS2 sheet
          adds unicode-range faces for the same family names.
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&display=swap"
          rel="stylesheet"
        />
        {/* Hangul UI labels — variable face via CDN */}
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

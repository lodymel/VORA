import { Gowun_Batang, Gowun_Dodum } from 'next/font/google'

/**
 * Gowun via next/font only ships latin/latin-ext/vietnamese.
 * Hangul glyphs load from the CSS2 sheet linked in app/layout.tsx
 * (unicode-range), so Batang/Dodum still render Korean correctly.
 */

/** Light hero — soft literary serif for Hangul. */
export const gowunBatang = Gowun_Batang({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-gowun-batang',
})

/** Light accent — quieter companion to Batang (Rosemartin role). */
export const gowunDodum = Gowun_Dodum({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-gowun-dodum',
})

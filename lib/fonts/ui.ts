import localFont from 'next/font/local'

/** Satoshi — UI / labels. Self-hosted for Capacitor offline. */
export const satoshi = localFont({
  src: [
    {
      path: '../../public/fonts/satoshi/Satoshi-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/satoshi/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

/** Pretendard — Hangul UI labels. Self-hosted for Capacitor offline. */
export const pretendard = localFont({
  src: [
    {
      path: '../../public/fonts/pretendard/Pretendard-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pretendard/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/pretendard/Pretendard-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-pretendard',
  display: 'swap',
})

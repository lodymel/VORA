import localFont from 'next/font/local'

/** Rosemartin — elegant serif for wordmark & accent. Free for commercial use. */
export const rosemartin = localFont({
  src: [
    {
      path: '../../public/fonts/sky/Rosemartin.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-rosemartin',
  display: 'swap',
})

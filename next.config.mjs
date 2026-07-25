/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Capacitor Android WebView
  output: 'export',
  // privacy/index.html so /privacy/ works offline and in simple hosts
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Hide the Next.js "N" dev indicator in the corner
  devIndicators: false,
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    source: '/api/:path*',
    destination: 'http://localhost:5001/api/:path*',
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Studio CRUD uses apiClient → NEXT_PUBLIC_API_URL directly.
  // Do NOT rewrite /api/* to localhost:5001 — that bypasses local Next.js routes
  // (image/upload, thumbnail/upload, audio/save, polls, etc.).
  images: {
    unoptimized: true,
  },
}

export default nextConfig
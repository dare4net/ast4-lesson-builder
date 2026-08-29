/** @type {import('next').NextConfig} */
const nextConfig = {
  // Studio CRUD uses apiClient → NEXT_PUBLIC_API_URL directly.
  // Do NOT rewrite /api/* to localhost:5001 — that bypasses local Next.js routes
  // (image/upload, thumbnail/upload, audio/save, polls, etc.).
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'http://192.168.43.224:3000',
    'http://192.168.*.*:3000',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

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
  // Prevent Next dev server from watching files that may be written/updated
  // during calculations or by local scripts. This avoids automatic full-page
  // reloads when those files change on disk.
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      // ignore patterns relative to the project root
      ignored: [
        '**/scripts/**',
        '**/fix-*.js',
        '**/*.md',
        '**/fixed.txt',
        '**/temp_ending.txt',
        '**/fixed.*',
      ],
    };
    return config;
  },
}

export default nextConfig

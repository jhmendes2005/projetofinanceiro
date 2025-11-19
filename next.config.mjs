/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    'pino', 
    'winston', 
    'bufferutil', 
    'utf-8-validate', 
  ],
}

export default nextConfig
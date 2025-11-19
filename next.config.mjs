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
    'ws', // <--- ADICIONE ISTO AQUI
  ],
}

export default nextConfig
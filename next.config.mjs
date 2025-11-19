/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Esta é a forma correta de corrigir erros de dependência no Next.js moderno.
  // Isso impede que o Next tente empacotar bibliotecas que usam recursos nativos do Node.
  serverExternalPackages: [
    'pino', 
    'winston', 
    'bufferutil', 
    'utf-8-validate', 
    'canvas',
    'sharp'
  ],
}

export default nextConfig
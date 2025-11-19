/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Adicione isto para corrigir o erro de __dirname em dependências
  serverExternalPackages: ['pino', 'winston', 'bufferutil', 'utf-8-validate'],
  
  // Às vezes necessário se o erro persistir:
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    return config
  },
}

export default nextConfig
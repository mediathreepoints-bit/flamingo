/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ['pdfkit'],
  images: { unoptimized: true },
  experimental: { optimizePackageImports: ['lucide-react', 'framer-motion'] },
  async headers() {
    return [
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }] },
    ];
  },
};

export default nextConfig;

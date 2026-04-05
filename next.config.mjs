/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel-da qurilayotgan bo'lsa to'liq server bo'ladi, kod orqali Android qilinayotgan bo'lsa export bo'ladi.
  output: process.env.VERCEL ? undefined : 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 't.me', 'telegram.org', 'lh3.googleusercontent.com', 'cdzwtoedvrdnxghazaux.supabase.co'],
  },
};


export default nextConfig;

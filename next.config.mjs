/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 't.me', 'telegram.org', 'lh3.googleusercontent.com', 'cdzwtoedvrdnxghazaux.supabase.co'],
  },
};


export default nextConfig;

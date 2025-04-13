/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL, // Use the variable defined in .env
  },
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;

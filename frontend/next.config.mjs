/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL, // Use the variable defined in .env
  },
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['sequelize', 'sqlite3', 'bcryptjs']
  }
};
module.exports = nextConfig;

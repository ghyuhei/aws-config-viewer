/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@aws-sdk'],
};

module.exports = nextConfig;

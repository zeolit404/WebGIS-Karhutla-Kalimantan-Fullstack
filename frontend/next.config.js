/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/geoserver/:path*',
        destination: 'http://localhost:8080/geoserver/:path*',
      },
      {
        source: '/graphql',
        destination: 'http://localhost:8000/graphql',
      },
    ];
  },
};

module.exports = nextConfig;

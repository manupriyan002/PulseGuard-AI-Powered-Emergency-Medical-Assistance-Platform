/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: process.env.LOCAL_IP ? [process.env.LOCAL_IP] : undefined,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin', // Ensure we can load external images/scripts if needed
          },
        ],
      },
    ];
  },
};

export default nextConfig;

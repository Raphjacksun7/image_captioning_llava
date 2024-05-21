/** @type {import('next').NextConfig} */
// module.exports = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'avatars.githubusercontent.com',
//         port: '',
//         pathname: '**'
//       }
//     ]
//   }
// }


const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  webpack: (config, { isServer, buildId, dev, isClient, defaultLoaders, webpack }) => {
    // Only perform this configuration on the client-side build
    if (!isServer) {
      config.resolve.fallback = config.resolve.fallback || {};
      config.resolve.fallback.crypto = require.resolve('crypto-browserify');
    }
    return config;
  },
};

module.exports = nextConfig;

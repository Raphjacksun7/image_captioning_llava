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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Setting up fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback, // Copy existing fallbacks
        crypto: require.resolve('crypto-browserify'), // Alias 'crypto' to 'crypto-browserify'
      };
    }
    return config;
  }
};

module.exports = nextConfig;

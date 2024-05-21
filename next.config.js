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
        stream: require.resolve('stream-browserify'), // Add polyfill for 'stream'
        buffer: require.resolve('buffer/'), // Add polyfill for 'buffer'
        'node:crypto': 'commonjs crypto',

      };
    }
    return config;
  }
};

module.exports = nextConfig;

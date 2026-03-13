const path = require('path');
const nextIntlConfigPath = './src/i18n/request.ts';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  turbopack: {
    root: path.join(__dirname, '..'),
    resolveAlias: {
      'next-intl/config': nextIntlConfigPath,
    },
  },
  webpack: (config) => {
    const resolvedPath = path.resolve(__dirname, nextIntlConfigPath);
    const alias = config.resolve?.alias ?? {};
    config.resolve = {
      ...(config.resolve ?? {}),
      alias: {
        ...alias,
        'next-intl/config': resolvedPath,
      },
    };
    return config;
  },
};

module.exports = nextConfig;

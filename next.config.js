const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // https://github.com/prisma/prisma/issues/6564#issuecomment-849685096
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('_http_common');
      // config.externals.push('encoding');
    }
    return config;
  },
  target: 'serverless',
});

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/
            }
          }
        }
      };
      webpackConfig.cache = {
        type: 'filesystem'
      };
      return webpackConfig;
    }
  }
};
module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Completely disable workbox plugins to avoid rollup dependency issues
      webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
        const pluginName = plugin.constructor.name;
        return !pluginName.includes('WorkboxWebpackPlugin') && 
               !pluginName.includes('GenerateSW') && 
               !pluginName.includes('InjectManifest');
      });
      
      // Disable service worker registration
      if (process.env.NODE_ENV === 'development') {
        webpackConfig.entry = {
          ...webpackConfig.entry,
          // Remove service worker registration
        };
      }
      
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
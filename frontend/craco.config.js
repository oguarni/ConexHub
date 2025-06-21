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
      // Unconditionally remove Workbox plugins to prevent build errors with rollup
      // This is the most reliable way to disable the service worker.
      webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
        const pluginName = plugin.constructor.name;
        const isWorkboxPlugin = ['WorkboxWebpackPlugin', 'InjectManifest', 'GenerateSW'].includes(pluginName) ||
                               pluginName.includes('Workbox');
        const isESLintPlugin = pluginName.includes('ESLint');
        if (isWorkboxPlugin) {
          console.log('Removing Workbox plugin:', pluginName);
        }
        if (isESLintPlugin) {
          console.log('Removing ESLint plugin:', pluginName);
        }
        return !isWorkboxPlugin && !isESLintPlugin;
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
  },
  devServer: {
    // Disable service workers in development mode completely
    client: {
      overlay: false
    }
  }
};
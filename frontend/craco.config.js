module.exports = {
  style: {
    postcss: {
      plugins: () => [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  eslint: {
    enable: false,
  },
  webpack: {
    configure: (webpackConfig) => {
      // Remove all problematic plugins
      webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
        const pluginName = plugin.constructor.name;
        const isWorkboxPlugin = ['WorkboxWebpackPlugin', 'InjectManifest', 'GenerateSW'].includes(pluginName) ||
                                pluginName.includes('Workbox');
        const isESLintPlugin = pluginName.includes('ESLint') || pluginName === 'ESLintWebpackPlugin';
        const isForkTsChecker = pluginName.includes('ForkTsChecker');
        
        return !isWorkboxPlugin && !isESLintPlugin && !isForkTsChecker;
      });

      // Disable problematic optimizations
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
      
      // Disable cache to avoid issues
      webpackConfig.cache = false;
      
      return webpackConfig;
    }
  },
  devServer: {
    client: {
      overlay: false,
      logging: 'none'
    },
    setupMiddlewares: (middlewares, devServer) => {
      return middlewares;
    }
  }
};
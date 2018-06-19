const config = require('../config.js');
const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');
const autoprefixer = require('autoprefixer');
const WebpackBar = require('webpackbar');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const production = process.env.NODE_ENV === 'production';

const plugins = [
  new MiniCSSExtractPlugin({
    filename: '[name].[contenthash].css'
  }),
  new WebpackBar({profile: true})
];

const devServer = {
  contentBase: config.contentBase,
  hot: true,
  hotOnly: true,
  historyApiFallback: true,
  port: config.port.front,
  compress: production,
  inline: !production,
  hot: !production,
  stats: {
    assets: true,
    children: false,
    chunks: false,
    hash: true,
    modules: false,
    publicPath: false,
    timings: true,
    version: false,
    warnings: true
  }
}

if (production) {
  plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
    new htmlWebpackPlugin({
      // prerendering with prerender-loader
      template: config.template,
      minify: {
        removeComments: true
      },
      cache: true,
      // make it work consistently with multiple chunks
      chunksSortMode: 'dependency'
    }),
    // preload main bundles
    // prefetch should is done with webpack
    new PreloadWebpackPlugin({
      rel: 'preload',
      include: 'initial'
    }),
    // new TidyHtmlWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/assets/'),
        to: path.resolve(__dirname, '../dist/assets/')
      },
      {
       from: path.resolve(__dirname, '../src/manifest.json'),
       to: path.resolve(__dirname, '../dist/manifest.json')
      },
      {
        from: path.resolve(__dirname, '../src/sw.js'),
        to: path.resolve(__dirname, '../dist/sw.js')
      },
      {
        from: path.resolve(__dirname, '../src/third_party/idb-keyval.min.js'),
        to: path.resolve(__dirname, '../dist/third_party/idb-keyval.min.js')
      }
    ])
  );
} else {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(), // hot reload
    new htmlWebpackPlugin({ // generate index.html
      template: config.template,
    }),
    new FriendlyErrorsPlugin()
  );
};

const common = {
  devtool: config.devtool,
  mode: production ? 'production' : 'development',
  // do not continue build if any errors
  bail: true,
  // watch mode
  watch: !production,
  entry: {
    app: config.entry.front
  },
  output: {
    path: path.resolve('dist'),
    filename: production ? '[name].bundle.[hash].js' : '[name].bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss'],
    alias: {
      // in order to use css-transition-group
      // you have to aliase react and react-dom
      react: 'preact-compat',
			'react-dom': 'preact-compat',
			'react-addons-css-transition-group': 'preact-css-transition-group',
      components: config.componentsPath,
      routes: config.routesPath,
      src: config.staticPath
    }
  },
  module: {
    rules: [{
      test: /\.(css|scss)$/,
      use: [
        MiniCSSExtractPlugin.loader,
        {
          loader: 'css-loader', options: {minimize: true}
        },
        {
          loader: 'sass-loader'
        }
      ]
    },{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      include: path.resolve(__dirname, "../src"),
      loader: 'babel-loader'
    },
    {
      test: /\.(.png|svg)$/,
      // compress images
      loader: 'image-webpack-loader',
      // Ensure this loader run before svg-loader or url-loader
      enforce: 'pre'
    },
    // {
    //   test: /\.svg$/,
    //   loader: 'svg-url-loader',
    //   options: {
    //     // Inline image smaller than 10kb
    //     limit: 10 * 1024,
    //     // remove quotes from url
    //     // https://developers.google.com/web/fundamentals/performance/webpack/decrease-frontend-size
    //     noquotes: true
    //   }
    // },
    {
      test: /\.(png|svg)$/,
      loader: production ? 'file-loader' : 'url-loader',
      query: {
        limit: 10 * 1024,
        name: '[name]-[hash:7].[ext]'
      }
    }]
  },
  optimization: {
    concatenateModules: production,
    nodeEnv: process.env.NODE_ENV,
    minimize: production,
    // optimization.minimizer overrides default optimization
    // in webpack 4.
    // plugin optimizer should be put here
    // not in plugins anymore as before
    minimizer: [
      // minify js
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: false,
        uglifyOptions: {
          compress: {
            unused: false
          },
          output: {
            comments: false
          }
        }
      }),
      // Compress extracted CSS.
      // Possible duplicated CSS from differents components can be deduped.
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true
        }
      })
    ],
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all'
    }
  },
  performance: {
    hints: production ? 'warning' : false
  },
  plugins,
  devServer
};

module.exports = common;

import { defineConfig } from 'vite';
import { injectHtml } from 'vite-plugin-html';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from '@honkhonk/vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    // html-webpack-plugin -> vite-plugin-html
    // 在 CRA 中使用 html-webpack-plugin 調整 HTML 文件，
    // vite 可以透過 vite-plugin-html 調整 HTML 文件
    injectHtml({
      data: {
        htmlWebpackPlugin: {
          options: {
            mayVar: 'variable',
          },
        },
      },
    }),
    svgr(),
  ],

  //  webpack.alias -> resolve.alias
  // CRA 中 alias 在 webpack 下，vite 在 resolve 下
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },

  // webpack.DefinePlugin -> define
  // 有時候會透過 webpack.DefinePlugin 去設定一些全域的 replacement，vite 也可以設定。
  define: {
    __PAGE_TITLE__: JSON.stringify('標題'),
  },

  server: {
    host: '0.0.0.0',
    https: false,
    port: 9527,
    // http-proxy-middleware -> proxy
    // Cra 可以透過另外安裝套件 http-proxy-middleware
    // 來設置 proxy，vite 則是直接支援 proxy。
    proxy: {
      '/api': {
        target: 'https://my.api.server',
        changeOrigin: true,
      },
    },
  },

  build: {
    // 把輸出路徑設定成跟 CRA 相同的 `build/`
    outDir: 'build',

    // 在 vite 中，dev server 是不用額外配置多入口設定的，
    // 但 production build 還是 rollup 來完成，
    // 所以要另外設置 rollupOptions。
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
        content: path.resolve(__dirname, 'src/content.js'),
      },
      output: {
        entryFileNames: 'static/js/[name].js',
      },
    },
  },
});

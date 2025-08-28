// vue.config.js
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8082,

    
    historyApiFallback: {
      rewrites: [{ from: /^\/oauth2\/callback$/, to: '/index.html' }]
    },

    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        ws: false,
        timeout: 120000
      },
      '/stomp': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        ws: true
      }
    }
  }
})

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    host: '0.0.0.0',
    proxy: {
      '^/api': {
        target: 'http://localhost:3000'
      }
    }
  }
}
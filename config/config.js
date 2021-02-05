import pageRoutes from './router.config'

const path = require('path')

function dir(d) {
  return path.resolve(__dirname, d)
}

function defineProperty() {
  const dev = {
    test: 'test',
    prod: 'prod',
  }
  return {
    'process.env.NODE_MODEL': process.env.NODE_MODEL ? 'mock' : '',
    'process.env.UMI_APP_DEV': dev[process.env.UMI_ENV] || 'dev',
  }
}

export default {
  plugins: [
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: true,
      title: 'edukg',
      dll: false,
      hardSource: false,
    }],
  ],
  outputPath: './public/knowledgeWiki/',
  publicPath: '/knowledgeWiki/',
  proxy: {
    '/knowledgeWiki/api/': { target: 'http://127.0.0.1:8848/', changeOrigin: true },
  },
  define: defineProperty(),
  routes: pageRoutes,
  alias: {
    '@': dir('./src'),
  },
  hash: true,
  theme: {
    'table-padding-horizontal': '10px',
    'table-padding-vertical': '10px',
    'primary-color': '#24b0e6',
  },
}

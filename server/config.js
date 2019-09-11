const express = require('express')

const config = {
  dev: {
    env: 'development',
    port: '8567',
    basePath: 'http://edukg.org',
  },
  test: {
    env: 'test',
    port: '8567',
    basePath: 'http://edukg.org',
  },
  production: {
    env: 'production',
    port: '8567',
    basePath: 'http://edukg.org',
  },
}
module.exports = config[process.env.NODE_ENV || 'development']

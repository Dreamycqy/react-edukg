const express = require('express')

const config = {
  dev: {
    env: 'development',
    port: '8567',
    basePath: 'http://edukg.cn',
    newPath: 'http://39.100.31.203:8080/res_lib/',
  },
  test: {
    env: 'test',
    port: '8567',
    basePath: 'http://edukg.cn',
    newPath: 'http://39.100.31.203:8080/res_lib/',
  },
  production: {
    env: 'production',
    port: '8567',
    basePath: 'http://edukg.cn',
    newPath: 'http://39.100.31.203:8080/res_lib/',
  },
}
module.exports = config[process.env.NODE_ENV || 'development']

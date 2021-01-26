const express = require('express')

const config = {
  dev: {
    env: 'development',
    port: '8345',
    basePath: 'http://edukg.cn',
    newPath: 'http://39.100.31.203:8080/res_lib',
    knowledge: 'http://39.100.31.203:8001/api',
    eduPath: 'http://39.100.31.203:8001',
  },
  test: {
    env: 'test',
    port: '8345',
    basePath: 'http://edukg.cn',
    newPath: 'http://39.100.31.203:8080/res_lib',
    knowledge: 'http://39.100.31.203:8001/api',
    eduPath: 'http://39.100.31.203:8001',
  },
  production: {
    env: 'production',
    port: '8345',
    basePath: 'http://edukg.cn',
    newPath: 'http://39.100.31.203:8080/res_lib',
    knowledge: 'http://39.100.31.203:8001/api',
    eduPath: 'http://39.100.31.203:8001',
  },
}
module.exports = config[process.env.NODE_ENV || 'development']

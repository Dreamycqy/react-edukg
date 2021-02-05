const request = require('request')
const express = require('express')
const qs = require('qs')

const router = express.Router()
const config = require('../config')

router.all('/', (req, res) => {
  const { hostname } = req
  const { method } = req
  let url = req.baseUrl
  const { basePath, newPath, knowledge, eduPath } = config
  if (url.indexOf('api') > -1) {
    url = url.split('/api')[1] // eslint-disable-line
  }
  if (url.indexOf('typeNew') > -1) {
    url = newPath + url.split('/typeNew/res_lib')[1]
  } else if (url.indexOf('science') > -1) {
    url = newPath + url
  } else if (url.indexOf('knowledgeUri') > -1) {
    url = knowledge + url.split('/knowledgeUri')[1]
  } else if (url.indexOf('typeAuth') > -1) {
    url = eduPath + '/api' + url.split('/typeAuth')[1]
  } else {
    url = (typeof basePath === 'string' ? basePath : basePath[hostname]) + url
  }
  if (url.indexOf('kCardSearch') > -1) {
    url = 'http://166.111.68.66:8077/linkInstance'
  }
  if (url.indexOf('getInstGraph') > -1) {
    url = 'http://166.111.7.170:28090/server/getInstGraph'
  }
  let webrsid = req.body.id
  if (method === 'GET') {
    webrsid = req.query.id
  }
  const opt = {
    method: req.method,
    url,
    headers: {
      'Content-Type': url.indexOf('/method/updateUserInfo') > -1 ? 'application/json;' : 'application/x-www-form-urlencoded; charset=UTF-8',
      'Cookie' : 'WEBRSID=' + webrsid,
    },
    timeout: 40e3,
    json: true,
    pool: {
      maxSockets: Infinity,
    },
  }
  delete req.body.id
  delete req.query.id
  if (method === 'GET') {
    opt.qs = req.query
  } else {
    opt.json = true
    opt.body = url.indexOf('/method/updateUserInfo') > -1 ? req.body : qs.stringify(req.body)
  }
  console.log(url, opt.body)
  request(opt, (error, response, body) => {
    try {
      if (!error) {
        if (opt.url.indexOf('logout') > -1) {
          cookie = []
        }
        if (response && response.statusCode) {
          res.status(response.statusCode)
        }
        if (typeof body === 'string') {
          if (opt.url.indexOf('login') > -1) {
            let id = ''
            if (response.headers['set-cookie'][0].indexOf('WEBRSID') > -1) {
              id = response.headers['set-cookie'][0].split(';')[0].split('=')[1]
            } else {
              id = response.headers['set-cookie'][1].split(';')[0].split('=')[1]
            }
            res.json({ ...JSON.parse(body), id })
          } else {
            res.json(JSON.parse(body))
          }
        } else {
          if (opt.url.indexOf('login') > -1) {
            let id = ''
            if (response.headers['set-cookie'][0].indexOf('WEBRSID') > -1) {
              id = response.headers['set-cookie'][0].split(';')[0].split('=')[1]
            } else {
              id = response.headers['set-cookie'][1].split(';')[0].split('=')[1]
            }
            res.json({ ...body, id })
          } else {
            res.json(body)
          }
        }
      } else {
        res.json({ header: { code: 1, message: typeof error === 'string' ? error : JSON.stringify(error) }, data: [] })
      }
    } catch (error) { // eslint-disable-line
      // res.json({ header: { code: 1, message: '服务器发生错误!', error, }, data: [] });
      res.json({ token: body })
    }
  })
})

module.exports = router

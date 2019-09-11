const index = require('./routes/index')
const proxy = require('./routes/proxy')

const routesConfig = [
  {
    path: ['/:module/api/*'],
    route: proxy,
  }, {
    path: '**',
    route: index,
  },
]

function initRoute(app) {
  for (let i = 0, len = routesConfig.length; i < len; i++) {
    const con = routesConfig[i]
    app.use(con.path, con.route)
  }
}

module.exports = initRoute

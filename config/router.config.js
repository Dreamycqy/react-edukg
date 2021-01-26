export default [
  {
    path: '/',
    redirect: '/searchPage',
  },
  {
    path: '/',
    component: '../layouts',
    routes: [
      {
        path: 'searchPage',
        component: './home/searchPage',
      },
      {
        path: 'newGraph',
        component: './graph/newGraph',
      },
      {
        path: 'knowledge',
        component: './graph/knowledge',
      },
      {
        path: 'classGraph',
        component: './graph/classGraph',
      },
      {
        path: 'kgPage',
        component: './kgPage/index',
      },
      {
        path: 'collection',
        component: './collection/index',
      },
    ],
  },
]

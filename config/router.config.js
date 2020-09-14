export default [
  {
    path: '/sekg',
    redirect: '/sekg/searchPage',
  },
  {
    path: '/sekg',
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
        path: 'classGraph',
        component: './graph/classGraph',
      },
    ],
  },
]

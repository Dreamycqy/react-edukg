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
    ],
  },
]

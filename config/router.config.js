export default [
  {
    path: '/',
    component: '../layouts',
    routes: [
      {
        path: '/',
        component: './index',
      },
      {
        path: 'fy',
        component: './fy',
      },
      {
        path: 'total',
        component: './total',
      },
      {
        path: 'graph',
        component: './graph',
      },
      {
        path: 'firstGraph',
        component: './graph/firstGraph',
      },
      {
        path: 'knowledgeCard',
        component: './knowledgeCard',
      },
      {
        path: 'qa',
        component: './qa',
      },
      {
        path: 'relatedPage',
        component: './relatedPage',
      },
      {
        path: 'getCard',
        component: './knowledgeCard/getCard',
      },
      {
        path: 'team',
        component: './team',
      },
    ],
  },
]

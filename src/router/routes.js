const routes = [
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '/login',
        component: () => import('pages/LoginPage.vue'),
      },
      {
        path: '/register',
        component: () => import('pages/RegisterPage.vue'),
      },
      {
        path: '/forgot-password',
        component: () => import('pages/ForgotPasswordPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

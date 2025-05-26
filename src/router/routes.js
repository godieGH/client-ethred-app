import { useUserStore } from 'stores/user'

const routes = [
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '/auth/login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        beforeEnter: async () => {
          const userStore = useUserStore()
          if (userStore.isLoggedIn) {
            await userStore.clearUser()
            return true
          }
        },
      },
      {
        path: '/auth/register',
        component: () => import('pages/RegisterPage.vue'),
      },
      {
        path: '/auth/forgot-password',
        component: () => import('pages/ForgotPasswordPage.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/',
        component: () => import('pages/AppPage.vue'),
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('pages/ProfilePage.vue'),
      },
      {
        path: '/people',
        name: 'people',
        component: () => import('pages/PeoplePage.vue'),
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

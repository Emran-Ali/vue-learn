import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import LogIn from '@/views/LogIn.vue'
import CreateUser from '@/views/CreateUser.vue'
import Message from '@/views/Message.vue'
import CreateCall from '@/components/callComponent/CreateCall.vue'

const routes = [
  {
    path: '/login',
    component: DefaultLayout,
    children: [{ path: '', name: 'login', component: LogIn }],
  },
  {
    path: '/create-user',
    component: DefaultLayout,
    children: [{ path: '', name: 'create-user', component: CreateUser }],
  },

  {
    path: '/',
    component: AuthLayout,
    children: [
      { path: 'message', name: 'message', component: Message },
      { path: 'create-call', name: 'create-call', component: CreateCall },
    ],
  },

  { path: '/:catchAll(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const needsAuth = to.matched.some((record) => record.parent?.components?.default === AuthLayout)
  if (needsAuth) {
    const apiKey = import.meta.env.VITE_STREAM_API_KEY
    const token = localStorage.getItem('streamToken')
    const userId = localStorage.getItem('user')
    if (!apiKey || !token || !userId) {
      return next('/login')
    }
  }
  next()
})

export default router

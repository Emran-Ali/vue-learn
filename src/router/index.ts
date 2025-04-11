import Blogs from '@/views/Blogs.vue'
import Home from '@/views/Home.vue'
import { createRouter, createWebHistory } from 'vue-router'

const route = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/blogs',
      name: 'blogs',
      component: Blogs,
    },
  ],
})

export default route

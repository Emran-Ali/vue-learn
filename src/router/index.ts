import Blogs from '@/views/Blogs.vue'
import Home from '@/views/Home.vue'
import LogIn from '@/views/LogIn.vue'
import Lesson from '@/views/Lesson.vue'
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
    {
      path: '/login',
      name: 'login',
      component: LogIn,
    },
    {
      path: '/lessons',
      name: 'Lesson-call',
      component: Lesson,
    },
  ],
})

export default route

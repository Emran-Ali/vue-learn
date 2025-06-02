import Blogs from '@/views/Blogs.vue'
import Home from '@/views/Home.vue'
import LogIn from '@/views/LogIn.vue'
import Lesson from '@/views/Lesson.vue'
import { createRouter, createWebHistory } from 'vue-router'
import CreateUser from '@/views/CreateUser.vue'
import Message from '@/views/Message.vue'
import CreateCall from '@/components/callComponent/CreateCall.vue'

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
      name: 'Lessons',
      component: Lesson,
    },
    {
      path: '/create-user',
      name: 'Create user',
      component: CreateUser,
    },
    {
      path: '/create-call',
      name: 'create-call',
      component: CreateCall,
    },
    {
      path: '/message',
      name: 'message',
      component: Message,
    },
  ],
})

export default route

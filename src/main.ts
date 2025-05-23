import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import route from './router'
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(route)
app.use(createPinia())
app.mount('#app')

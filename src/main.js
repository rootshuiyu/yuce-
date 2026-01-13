import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { categoryInitService } from './services/categoryInitService.js'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 初始化分类数据
categoryInitService.initializeCategories().then(() => {
  app.mount('#app')
}).catch(error => {
  console.error('应用初始化失败:', error)
  app.mount('#app')
})

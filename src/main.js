import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { categoryInitService } from './services/categoryInitService.js'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 立即挂载应用，分类初始化在后台进行（不阻塞应用启动）
app.mount('#app')

// 后台初始化分类数据（不阻塞应用启动）
categoryInitService.initializeCategories().catch(error => {
  console.error('分类初始化失败:', error)
})

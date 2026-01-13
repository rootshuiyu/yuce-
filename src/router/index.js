import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MarketDetail from '../views/MarketDetail.vue'
import UserCenter from '../views/UserCenter.vue'
import Admin from '../views/Admin.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/market/:id',
    name: 'MarketDetail',
    component: MarketDetail
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: UserCenter
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MarketDetail from '../views/MarketDetail.vue'
import UserCenter from '../views/UserCenter.vue'
import Admin from '../views/Admin.vue'
import CreateMarket from '../views/CreateMarket.vue'
import EditMarket from '../views/EditMarket.vue'

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
  },
  {
    path: '/create',
    name: 'CreateMarket',
    component: CreateMarket
  },
  {
    path: '/edit/:id',
    name: 'EditMarket',
    component: EditMarket
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

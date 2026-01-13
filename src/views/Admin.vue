<template>
  <div class="admin-container">
    <!-- 登录界面 -->
    <div v-if="!isLoggedIn" class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🔐 管理后台</h1>
          <p>Super Truth 预测市场管理系统</p>
        </div>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="loginForm.username" type="text" placeholder="请输入用户名" required />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input v-model="loginForm.password" type="password" placeholder="请输入密码" required />
          </div>
          <div v-if="loginError" class="error-message">{{ loginError }}</div>
          <button type="submit" class="login-btn" :disabled="isLogging">
            {{ isLogging ? '登录中...' : '登录' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 管理界面 -->
    <div v-else class="admin-layout">
      <!-- 侧边栏 -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2>🎯 Super Truth</h2>
          <span class="admin-badge">管理员</span>
        </div>
        <nav class="sidebar-nav">
          <a 
            v-for="item in menuItems" 
            :key="item.id"
            :class="['nav-item', { active: activeMenu === item.id }]"
            @click="activeMenu = item.id"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <button @click="handleLogout" class="logout-btn">
            🚪 退出登录
          </button>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="admin-main">
        <!-- 仪表板 -->
        <div v-if="activeMenu === 'dashboard'" class="dashboard-section">
          <h2>📊 仪表板</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <span class="stat-value">{{ dashboardStats.overview?.totalMarkets || 0 }}</span>
                <span class="stat-label">总市场数</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <span class="stat-value">{{ dashboardStats.overview?.activeMarkets || 0 }}</span>
                <span class="stat-label">活跃市场</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏳</div>
              <div class="stat-info">
                <span class="stat-value">{{ dashboardStats.overview?.pendingMarkets || 0 }}</span>
                <span class="stat-label">待审核</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <span class="stat-value">${{ formatNumber(dashboardStats.overview?.totalVolume || 0) }}</span>
                <span class="stat-label">总交易量</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 市场管理 -->
        <div v-if="activeMenu === 'markets'" class="markets-section">
          <div class="section-header">
            <h2>🏪 市场管理</h2>
            <div class="filter-tabs">
              <button 
                v-for="tab in marketTabs" 
                :key="tab.value"
                :class="['tab-btn', { active: marketFilter === tab.value }]"
                @click="marketFilter = tab.value; loadMarkets()"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
          <div class="markets-table">
            <table>
              <thead>
                <tr>
                  <th>市场</th>
                  <th>分类</th>
                  <th>状态</th>
                  <th>交易量</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="market in markets" :key="market.id">
                  <td class="market-title">{{ market.title }}</td>
                  <td>{{ market.category }}</td>
                  <td>
                    <span :class="['status-badge', market.status]">
                      {{ getStatusLabel(market.status) }}
                    </span>
                  </td>
                  <td>${{ formatNumber(market.volume || 0) }}</td>
                  <td>{{ formatDate(market.createdAt) }}</td>
                  <td class="actions">
                    <button 
                      v-if="market.status === 'pending'" 
                      @click="approveMarket(market.id)"
                      class="action-btn approve"
                    >
                      ✅ 批准
                    </button>
                    <button 
                      v-if="market.status === 'pending'" 
                      @click="rejectMarket(market.id)"
                      class="action-btn reject"
                    >
                      ❌ 拒绝
                    </button>
                    <button 
                      v-if="market.status === 'active'" 
                      @click="openSettleModal(market)"
                      class="action-btn settle"
                    >
                      🏁 结算
                    </button>
                    <button 
                      v-if="market.status === 'pending' || market.status === 'rejected'" 
                      @click="deleteMarket(market.id)"
                      class="action-btn delete"
                    >
                      🗑️ 删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 用户管理 -->
        <div v-if="activeMenu === 'users'" class="users-section">
          <div class="section-header">
            <h2>👥 用户管理</h2>
            <div class="search-box">
              <input v-model="userSearch" placeholder="搜索用户地址..." @input="loadUsers" />
            </div>
          </div>
          <div class="users-table">
            <table>
              <thead>
                <tr>
                  <th>用户地址</th>
                  <th>余额</th>
                  <th>状态</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td class="user-address">{{ formatAddress(user.address) }}</td>
                  <td>${{ formatNumber(user.balance || 0) }}</td>
                  <td>
                    <span :class="['status-badge', user.status || 'active']">
                      {{ user.status === 'banned' ? '已封禁' : '正常' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td class="actions">
                    <button 
                      v-if="user.status !== 'banned'" 
                      @click="banUser(user.id)"
                      class="action-btn ban"
                    >
                      🚫 封禁
                    </button>
                    <button 
                      v-else 
                      @click="unbanUser(user.id)"
                      class="action-btn unban"
                    >
                      ✅ 解封
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 分类管理 -->
        <div v-if="activeMenu === 'categories'" class="categories-section">
          <div class="section-header">
            <h2>📁 分类管理</h2>
            <button @click="showCategoryModal = true" class="add-btn">
              ➕ 添加分类
            </button>
          </div>
          <div class="categories-list">
            <div v-for="category in categories" :key="category.id" class="category-card">
              <div class="category-header">
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
              </div>
              <div class="subcategories">
                <span v-for="sub in category.subcategories" :key="sub.id" class="subcategory-tag">
                  {{ sub.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统设置 -->
        <div v-if="activeMenu === 'settings'" class="settings-section">
          <h2>⚙️ 系统设置</h2>
          <div class="settings-form">
            <div class="setting-group">
              <h3>平台设置</h3>
              <div class="setting-item">
                <label>平台名称</label>
                <input v-model="settings.platformName" type="text" />
              </div>
              <div class="setting-item">
                <label>平台费率 (%)</label>
                <input v-model.number="settings.platformFee" type="number" step="0.01" />
              </div>
            </div>
            <div class="setting-group">
              <h3>交易设置</h3>
              <div class="setting-item">
                <label>最小下注金额</label>
                <input v-model.number="settings.minBetAmount" type="number" />
              </div>
              <div class="setting-item">
                <label>最大下注金额</label>
                <input v-model.number="settings.maxBetAmount" type="number" />
              </div>
            </div>
            <div class="setting-group">
              <h3>合约设置</h3>
              <div class="setting-item">
                <label>合约地址</label>
                <input v-model="settings.contractAddress" type="text" placeholder="0x..." />
              </div>
              <div class="setting-item">
                <label>链 ID</label>
                <input v-model.number="settings.chainId" type="number" />
              </div>
            </div>
            <button @click="saveSettings" class="save-btn">💾 保存设置</button>
          </div>
        </div>
      </main>
    </div>

    <!-- 结算模态框 -->
    <div v-if="showSettleModal" class="modal-overlay" @click.self="showSettleModal = false">
      <div class="modal-content">
        <h3>🏁 结算市场</h3>
        <p>市场: {{ settlingMarket?.title }}</p>
        <div class="settle-options">
          <button @click="settleMarket('yes')" class="settle-yes">YES 获胜</button>
          <button @click="settleMarket('no')" class="settle-no">NO 获胜</button>
        </div>
        <button @click="showSettleModal = false" class="cancel-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// 登录状态
const isLoggedIn = ref(false)
const adminToken = ref('')
const adminInfo = ref(null)
const loginForm = ref({ username: '', password: '' })
const loginError = ref('')
const isLogging = ref(false)

// 菜单
const activeMenu = ref('dashboard')
const menuItems = [
  { id: 'dashboard', name: '仪表板', icon: '📊' },
  { id: 'markets', name: '市场管理', icon: '🏪' },
  { id: 'users', name: '用户管理', icon: '👥' },
  { id: 'categories', name: '分类管理', icon: '📁' },
  { id: 'settings', name: '系统设置', icon: '⚙️' }
]

// 数据
const dashboardStats = ref({})
const markets = ref([])
const users = ref([])
const categories = ref([])
const settings = ref({})

// 过滤
const marketFilter = ref('')
const userSearch = ref('')
const marketTabs = [
  { label: '全部', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '活跃', value: 'active' },
  { label: '已结算', value: 'settled' }
]

// 模态框
const showSettleModal = ref(false)
const settlingMarket = ref(null)
const showCategoryModal = ref(false)

// API 请求头
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${adminToken.value}`
})

// 登录
const handleLogin = async () => {
  isLogging.value = true
  loginError.value = ''
  
  try {
    const response = await axios.post(`${API_BASE}/api/admin/login`, loginForm.value)
    if (response.data.success) {
      adminToken.value = response.data.data.token
      adminInfo.value = response.data.data.admin
      isLoggedIn.value = true
      localStorage.setItem('adminToken', adminToken.value)
      loadDashboard()
    }
  } catch (error) {
    loginError.value = error.response?.data?.error || '登录失败'
  } finally {
    isLogging.value = false
  }
}

// 登出
const handleLogout = () => {
  isLoggedIn.value = false
  adminToken.value = ''
  adminInfo.value = null
  localStorage.removeItem('adminToken')
}

// 加载仪表板
const loadDashboard = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/admin/dashboard`, { headers: getHeaders() })
    if (response.data.success) {
      dashboardStats.value = response.data.data
    }
  } catch (error) {
    console.error('加载仪表板失败:', error)
  }
}

// 加载市场
const loadMarkets = async () => {
  try {
    const params = marketFilter.value ? `?status=${marketFilter.value}` : ''
    const response = await axios.get(`${API_BASE}/api/admin/markets${params}`, { headers: getHeaders() })
    if (response.data.success) {
      markets.value = response.data.data.markets
    }
  } catch (error) {
    console.error('加载市场失败:', error)
  }
}

// 加载用户
const loadUsers = async () => {
  try {
    const params = userSearch.value ? `?search=${userSearch.value}` : ''
    const response = await axios.get(`${API_BASE}/api/admin/users${params}`, { headers: getHeaders() })
    if (response.data.success) {
      users.value = response.data.data.users
    }
  } catch (error) {
    console.error('加载用户失败:', error)
  }
}

// 加载分类
const loadCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/categories`)
    if (response.data.success) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载设置
const loadSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/admin/settings`, { headers: getHeaders() })
    if (response.data.success) {
      settings.value = response.data.data
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 批准市场
const approveMarket = async (marketId) => {
  try {
    await axios.post(`${API_BASE}/api/admin/markets/${marketId}/approve`, {}, { headers: getHeaders() })
    loadMarkets()
  } catch (error) {
    alert(error.response?.data?.error || '操作失败')
  }
}

// 拒绝市场
const rejectMarket = async (marketId) => {
  const reason = prompt('请输入拒绝原因:')
  if (!reason) return
  
  try {
    await axios.post(`${API_BASE}/api/admin/markets/${marketId}/reject`, { reason }, { headers: getHeaders() })
    loadMarkets()
  } catch (error) {
    alert(error.response?.data?.error || '操作失败')
  }
}

// 打开结算模态框
const openSettleModal = (market) => {
  settlingMarket.value = market
  showSettleModal.value = true
}

// 结算市场
const settleMarket = async (outcome) => {
  try {
    await axios.post(
      `${API_BASE}/api/admin/markets/${settlingMarket.value.id}/settle`,
      { outcome },
      { headers: getHeaders() }
    )
    showSettleModal.value = false
    loadMarkets()
  } catch (error) {
    alert(error.response?.data?.error || '结算失败')
  }
}

// 删除市场
const deleteMarket = async (marketId) => {
  if (!confirm('确定要删除这个市场吗？')) return
  
  try {
    await axios.delete(`${API_BASE}/api/admin/markets/${marketId}`, { headers: getHeaders() })
    loadMarkets()
  } catch (error) {
    alert(error.response?.data?.error || '删除失败')
  }
}

// 封禁用户
const banUser = async (userId) => {
  const reason = prompt('请输入封禁原因:')
  if (!reason) return
  
  try {
    await axios.post(`${API_BASE}/api/admin/users/${userId}/ban`, { reason }, { headers: getHeaders() })
    loadUsers()
  } catch (error) {
    alert(error.response?.data?.error || '操作失败')
  }
}

// 解封用户
const unbanUser = async (userId) => {
  try {
    await axios.post(`${API_BASE}/api/admin/users/${userId}/unban`, {}, { headers: getHeaders() })
    loadUsers()
  } catch (error) {
    alert(error.response?.data?.error || '操作失败')
  }
}

// 保存设置
const saveSettings = async () => {
  try {
    await axios.put(`${API_BASE}/api/admin/settings`, settings.value, { headers: getHeaders() })
    alert('设置已保存')
  } catch (error) {
    alert(error.response?.data?.error || '保存失败')
  }
}

// 工具函数
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toFixed(0)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatAddress = (address) => {
  if (!address) return '-'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '待审核',
    active: '活跃',
    settled: '已结算',
    rejected: '已拒绝'
  }
  return labels[status] || status
}

// 初始化
onMounted(() => {
  const savedToken = localStorage.getItem('adminToken')
  if (savedToken) {
    adminToken.value = savedToken
    // 验证 token
    axios.get(`${API_BASE}/api/admin/verify`, { headers: { Authorization: `Bearer ${savedToken}` } })
      .then(response => {
        if (response.data.success) {
          isLoggedIn.value = true
          adminInfo.value = response.data.data.admin
          loadDashboard()
          loadMarkets()
          loadUsers()
          loadCategories()
          loadSettings()
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken')
      })
  }
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0a1a 0%, #1a1428 100%);
  color: #e5e7eb;
}

/* 登录界面 */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.login-card {
  background: #2a1f3d;
  border: 1px solid #3d2f52;
  border-radius: 1rem;
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #9ca3af;
}

.login-form .form-group {
  margin-bottom: 1.5rem;
}

.login-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.login-form input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #1a1428;
  border: 1px solid #3d2f52;
  border-radius: 0.5rem;
  color: #e5e7eb;
  font-size: 1rem;
}

.login-form input:focus {
  outline: none;
  border-color: #a78bfa;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.login-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(167, 139, 250, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 管理界面布局 */
.admin-layout {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏 */
.admin-sidebar {
  width: 260px;
  background: #1a1428;
  border-right: 1px solid #3d2f52;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #3d2f52;
}

.sidebar-header h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.admin-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: #2a1f3d;
  color: #e5e7eb;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(167, 139, 250, 0.2) 0%, transparent 100%);
  color: #a78bfa;
  border-left: 3px solid #a78bfa;
}

.nav-icon {
  font-size: 1.25rem;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid #3d2f52;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 0.5rem;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #ef4444;
  color: white;
}

/* 主内容区 */
.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* 仪表板 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.stat-card {
  background: #2a1f3d;
  border: 1px solid #3d2f52;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #a78bfa;
}

.stat-label {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* 表格 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #3d2f52;
  border-radius: 0.5rem;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #a78bfa;
  border-color: #a78bfa;
  color: white;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #2a1f3d;
  border-radius: 1rem;
  overflow: hidden;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #3d2f52;
}

th {
  background: #1a1428;
  font-weight: 600;
  color: #9ca3af;
}

.market-title {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-badge.settled {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.approve {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.action-btn.reject, .action-btn.ban {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn.settle {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.action-btn.unban {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

/* 搜索框 */
.search-box input {
  padding: 0.5rem 1rem;
  background: #1a1428;
  border: 1px solid #3d2f52;
  border-radius: 0.5rem;
  color: #e5e7eb;
  width: 250px;
}

/* 分类管理 */
.add-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
}

.categories-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.category-card {
  background: #2a1f3d;
  border: 1px solid #3d2f52;
  border-radius: 1rem;
  padding: 1.5rem;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.category-icon {
  font-size: 1.5rem;
}

.category-name {
  font-weight: 600;
}

.subcategories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.subcategory-tag {
  padding: 0.25rem 0.75rem;
  background: #1a1428;
  border-radius: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

/* 设置 */
.settings-form {
  max-width: 600px;
}

.setting-group {
  background: #2a1f3d;
  border: 1px solid #3d2f52;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.setting-group h3 {
  margin-bottom: 1rem;
  color: #a78bfa;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.setting-item label {
  color: #9ca3af;
}

.setting-item input {
  padding: 0.5rem 1rem;
  background: #1a1428;
  border: 1px solid #3d2f52;
  border-radius: 0.5rem;
  color: #e5e7eb;
  width: 200px;
}

.save-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #2a1f3d;
  border: 1px solid #3d2f52;
  border-radius: 1rem;
  padding: 2rem;
  min-width: 400px;
  text-align: center;
}

.modal-content h3 {
  margin-bottom: 1rem;
}

.settle-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1.5rem 0;
}

.settle-yes {
  padding: 1rem 2rem;
  background: #22c55e;
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.settle-no {
  padding: 1rem 2rem;
  background: #ef4444;
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  padding: 0.5rem 1.5rem;
  background: transparent;
  border: 1px solid #3d2f52;
  border-radius: 0.5rem;
  color: #9ca3af;
  cursor: pointer;
}
</style>

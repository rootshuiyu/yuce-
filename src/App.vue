<template>
  <div class="app-layout">
    <!-- 顶部导航栏 -->
    <header class="top-navbar">
      <div class="navbar-container">
        <router-link to="/" class="navbar-logo">
          🎯 Super Truth
        </router-link>

        <div class="navbar-right">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索市场..."
              @keyup.enter="handleSearch"
            />
          </div>

          <div class="balance-info">
            <div class="balance-item">
              <span class="label">余额</span>
              <span class="value">{{ walletStore.balance || '0.00' }}</span>
            </div>
          </div>

          <button class="navbar-icon">🔔</button>

          <div class="wallet-section">
            <!-- 钱包信息 -->
            <div v-if="walletStore.isConnected" class="wallet-info-display">
              <div class="chain-info">{{ walletStore.chainName }}</div>
              <div class="balance-info-detail">
                {{ walletStore.formattedBalance }} {{ walletStore.getNetworkSymbol(walletStore.chainId) }}
              </div>
            </div>
            
            <!-- 连接/断开按钮 -->
            <button
              v-if="!walletStore.isConnected"
              @click="connectWallet"
              class="btn-connect"
              :disabled="walletStore.isLoading"
            >
              <span v-if="walletStore.isLoading" class="spinner"></span>
              <span v-else>连接钱包</span>
            </button>
            <div v-else class="wallet-connected">
              <button class="wallet-btn" @click="showWalletMenu = !showWalletMenu">
                {{ walletStore.shortAddress }}
              </button>
              <button class="disconnect-btn" @click="disconnectWallet" title="断开连接">
                ✗
              </button>
            </div>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="walletStore.error" class="error-toast">
            <span>⚠️ {{ walletStore.error }}</span>
            <button @click="walletStore.error = null">✗</button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主布局 - 左侧边栏 + 右侧内容 -->
    <div class="main-layout">
      <!-- 左侧分类边栏 -->
      <aside class="sidebar">
        <div class="sidebar-content">
          <!-- 一级分类 -->
          <div class="categories-group">
            <h3 class="group-title">分类</h3>
            <button
              class="category-item"
              :class="{ active: selectedPrimaryCategory === 'all' }"
              @click="selectPrimaryCategory('all')"
            >
              <span class="category-icon">📊</span>
              <span class="category-label">全部</span>
            </button>
            <button
              v-for="category in primaryCategories"
              :key="category.id"
              class="category-item"
              :class="{ active: selectedPrimaryCategory === category.id }"
              @click="selectPrimaryCategory(category.id)"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-label">{{ category.name }}</span>
            </button>
          </div>

          <!-- 二级分类 -->
          <div v-if="subcategories.length > 0" class="subcategories-group">
            <h3 class="group-title">{{ selectedPrimaryCategoryName }}</h3>
            <button
              class="subcategory-item"
              :class="{ active: selectedSubcategory === null }"
              @click="selectSubcategory(null)"
            >
              <span class="subcategory-dot"></span>
              <span class="subcategory-label">全部</span>
            </button>
            <button
              v-for="subcat in subcategories"
              :key="subcat.id"
              class="subcategory-item"
              :class="{ active: selectedSubcategory === subcat.id }"
              @click="selectSubcategory(subcat.id)"
            >
              <span class="subcategory-dot"></span>
              <span class="subcategory-label">{{ subcat.name }}</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- 右侧主内容区 -->
      <main class="main-content">
        <!-- 工具栏 -->
        <div class="toolbar">
          <!-- 创建市场按钮 -->
          <button class="btn-create-market" @click="showCreateMarketModal = true">
            <span class="btn-icon">+</span>
            <span class="btn-text">创建市场</span>
          </button>

          <div class="toolbar-left">
            <div class="filter-group">
              <label>排序:</label>
              <select v-model="sortBy" class="filter-select">
                <option value="volume">交易量</option>
                <option value="probability">概率</option>
                <option value="newest">最新</option>
              </select>
            </div>

            <div class="filter-group">
              <label>状态:</label>
              <select v-model="statusFilter" class="filter-select">
                <option value="all">全部</option>
                <option value="active">交易中</option>
                <option value="ended">已结束</option>
              </select>
            </div>
          </div>

          <div class="toolbar-right">
            <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
              📊 网格
            </button>
            <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
              📋 列表
            </button>
            <button class="view-btn">
              ❤️ 收藏
            </button>
          </div>
        </div>

        <!-- 市场列表 -->
        <Home
          :selectedPrimaryCategory="selectedPrimaryCategory"
          :selectedSubcategory="selectedSubcategory"
          :sortBy="sortBy"
          :statusFilter="statusFilter"
          :viewMode="viewMode"
        />
      </main>
    </div>

    <!-- 创建市场模态框 -->
    <CreateMarketModal
      :is-open="showCreateMarketModal"
      @close="showCreateMarketModal = false"
      @success="handleMarketCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from './stores/wallet'
import Home from './views/Home.vue'
import CreateMarketModal from './components/CreateMarketModal.vue'

const router = useRouter()
const walletStore = useWalletStore()

const showWalletMenu = ref(false)

const connectWallet = async () => {
  const success = await walletStore.connectWallet()
  if (success) {
    console.log('钱包连接成功')
  }
}

const disconnectWallet = () => {
  walletStore.disconnectWallet()
  showWalletMenu.value = false
}

const formatAddress = (addr) => {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const searchQuery = ref('')
const selectedPrimaryCategory = ref('cat_politics')
const selectedSubcategory = ref(null)
const primaryCategories = ref([])
const subcategories = ref([])
const sortBy = ref('volume')
const statusFilter = ref('all')
const viewMode = ref('grid')
const showCreateMarketModal = ref(false)

const selectedPrimaryCategoryName = computed(() => {
  if (selectedPrimaryCategory.value === 'all') return '全部'
  const category = primaryCategories.value.find(c => c.id === selectedPrimaryCategory.value)
  return category?.name || '分类'
})

onMounted(async () => {
  // 获取一级分类
  try {
    const response = await fetch('/api/categories/primary')
    const data = await response.json()
    primaryCategories.value = data.data || []
    
    // 初始化二级分类
    if (primaryCategories.value.length > 0) {
      await loadSubcategories(selectedPrimaryCategory.value)
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
})

const selectPrimaryCategory = async (categoryId) => {
  selectedPrimaryCategory.value = categoryId
  selectedSubcategory.value = null
  
  if (categoryId !== 'all') {
    await loadSubcategories(categoryId)
  } else {
    subcategories.value = []
  }
}

const selectSubcategory = (subcategoryId) => {
  // 如果点击的是二级分类对象，使用其 ID；否则使用传入的值
  if (subcategoryId && typeof subcategoryId === 'object') {
    selectedSubcategory.value = subcategoryId.id
  } else {
    selectedSubcategory.value = subcategoryId
  }
}

const loadSubcategories = async (categoryId) => {
  try {
    const response = await fetch(`/api/categories/${categoryId}/subcategories`)
    const data = await response.json()
    subcategories.value = data.data || []
  } catch (error) {
    console.error('获取子分类失败:', error)
    subcategories.value = []
  }
}

const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
}

const handleMarketCreated = () => {
  // 市场创建成功，刷新市场列表
  console.log('市场创建成功')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-dark-bg);
}

/* ===== 顶部导航栏 ===== */
.top-navbar {
  background-color: var(--color-dark-card);
  border-bottom: 1px solid var(--color-dark-border);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 60px;
}

.navbar-container {
  max-width: 100%;
  height: 100%;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.navbar-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-purple-light);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.navbar-logo:hover {
  color: var(--color-purple-primary);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: flex-end;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-dark-bg);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  flex: 0 1 300px;
  max-width: 300px;
}

.search-icon {
  font-size: 1rem;
  color: #9ca3af;
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  color: #e5e7eb;
  font-size: 0.875rem;
  outline: none;
}

.search-box input::placeholder {
  color: #6b7280;
}

.balance-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.balance-item .label {
  color: #9ca3af;
}

.balance-item .value {
  color: var(--color-purple-light);
  font-weight: 600;
}

.navbar-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.3s ease;
}

.navbar-icon:hover {
  color: var(--color-purple-light);
}

.wallet-section {
  display: flex;
  gap: 0.5rem;
}

.btn-connect {
  padding: 0.5rem 1rem;
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-connect:hover {
  background-color: var(--color-purple-light);
  transform: translateY(-2px);
}

.wallet-btn {
  padding: 0.5rem 1rem;
  background-color: var(--color-dark-bg);
  color: var(--color-purple-light);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.wallet-btn:hover {
  border-color: var(--color-purple-primary);
  color: var(--color-purple-primary);
}

.wallet-info-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.75rem;
}

.chain-info {
  color: #9ca3af;
  font-weight: 500;
}

.balance-info-detail {
  color: var(--color-purple-light);
  font-weight: 600;
}

.wallet-connected {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.disconnect-btn {
  padding: 0.5rem 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.375rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.disconnect-btn:hover {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}

.error-toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.375rem;
  color: #fca5a5;
  font-size: 0.875rem;
  z-index: 999;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.error-toast button {
  background: none;
  border: none;
  color: #fca5a5;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  transition: color 0.3s ease;
}

.error-toast button:hover {
  color: #ff6b6b;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #9ca3af;
  border-top-color: var(--color-purple-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-create-market {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-create-market:hover {
  background-color: var(--color-purple-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
}

.btn-create-market .btn-icon {
  font-size: 1.25rem;
  font-weight: 700;
}

.btn-create-market .btn-text {
  display: none;
}

@media (min-width: 768px) {
  .btn-create-market .btn-text {
    display: inline;
  }
}

/* ===== 主布局 ===== */
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ===== 左侧边栏 ===== */
.sidebar {
  width: 280px;
  background-color: var(--color-dark-card);
  border-right: 1px solid var(--color-dark-border);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--color-dark-border) transparent;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--color-dark-border);
  border-radius: 3px;
}

.sidebar-content {
  padding: 1.5rem 0;
}

.categories-group,
.subcategories-group {
  padding: 0 1rem;
  margin-bottom: 1.5rem;
}

.group-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding: 0 0.5rem;
}

.category-item,
.subcategory-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 0.5rem;
  background: none;
  border: none;
  border-radius: 0.375rem;
  color: #9ca3af;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.category-item:hover,
.subcategory-item:hover {
  background-color: var(--color-dark-bg);
  color: var(--color-purple-light);
}

.category-item.active,
.subcategory-item.active {
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
  font-weight: 600;
}

.category-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.category-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subcategory-dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  background-color: currentColor;
  border-radius: 50%;
  flex-shrink: 0;
}

.subcategory-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 右侧主内容区 ===== */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-dark-border);
  flex-wrap: wrap;
  background-color: var(--color-dark-bg);
}

.toolbar-left {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  color: #9ca3af;
}

.filter-select {
  padding: 0.5rem;
  background-color: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  color: #e5e7eb;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover {
  border-color: var(--color-purple-primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-purple-primary);
}

.toolbar-right {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  background-color: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  color: #9ca3af;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.view-btn:hover {
  border-color: var(--color-purple-primary);
  color: var(--color-purple-light);
}

.view-btn.active {
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
  border-color: var(--color-purple-primary);
}

/* ===== 响应式设计 ===== */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .search-box {
    flex: 0 1 250px;
    max-width: 250px;
  }

  .category-item,
  .subcategory-item {
    padding: 0.625rem 0.5rem;
    font-size: 0.8125rem;
  }

  .category-icon {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid var(--color-dark-border);
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .sidebar-content {
    display: flex;
    gap: 2rem;
    padding: 1rem;
    width: max-content;
  }

  .categories-group,
  .subcategories-group {
    padding: 0;
    margin: 0;
    min-width: max-content;
  }

  .group-title {
    display: none;
  }

  .category-item,
  .subcategory-item {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    border-radius: 20px;
    border: 1px solid var(--color-dark-border);
  }

  .category-item.active,
  .subcategory-item.active {
    background-color: var(--color-purple-primary);
    border-color: var(--color-purple-primary);
  }

  .search-box {
    flex: 0 1 200px;
    max-width: 200px;
  }

  .balance-info {
    display: none;
  }

  .toolbar {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .filter-group label {
    font-size: 0.8rem;
  }

  .filter-select {
    padding: 0.375rem;
    font-size: 0.8rem;
  }

  .view-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 1rem;
    gap: 0.5rem;
  }

  .navbar-logo {
    font-size: 1rem;
  }

  .navbar-right {
    gap: 0.5rem;
  }

  .search-box {
    flex: 0 1 150px;
    max-width: 150px;
  }

  .search-icon {
    font-size: 0.875rem;
  }

  .navbar-icon {
    font-size: 1rem;
  }

  .btn-connect {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }

  .sidebar-content {
    gap: 1.5rem;
    padding: 0.75rem;
  }

  .category-item,
  .subcategory-item {
    padding: 0.4rem 0.625rem;
    font-size: 0.75rem;
  }

  .category-icon {
    font-size: 0.9rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.75rem 1rem;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }
}
</style>

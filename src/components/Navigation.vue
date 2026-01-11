<template>
  <nav class="navbar">
    <!-- 第一行：Logo、搜索、钱包信息 -->
    <div class="navbar-top">
      <div class="navbar-left">
        <router-link to="/" class="navbar-logo">
          🎯 Super Truth
        </router-link>
        
        <div class="navbar-search">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索市场"
            @keyup.enter="handleSearch"
          />
          <span class="search-divider">/</span>
        </div>
      </div>

      <div class="navbar-right">
        <div class="balance-display">
          <div class="balance-item">
            <span class="balance-label">文件夹</span>
            <span class="balance-value">{{ walletStore.balance || '0.00' }}</span>
            <span class="balance-unit">美元</span>
          </div>
          <div class="balance-item">
            <span class="balance-label">现金</span>
            <span class="balance-value">{{ walletStore.cashBalance || '0.00' }}</span>
            <span class="balance-unit">美元</span>
          </div>
        </div>

        <button class="navbar-icon">🔔</button>
        
        <div class="navbar-wallet">
          <button v-if="!walletStore.isConnected" @click="connectWallet" class="btn-connect">
            连接钱包
          </button>
          <button v-else @click="toggleWalletMenu" class="wallet-menu-btn">
            <span class="wallet-avatar">👤</span>
            <span class="wallet-address">{{ formatAddress(walletStore.address) }}</span>
            <span class="dropdown-arrow">▼</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 第二行：热门活动和主要分类 -->
    <div class="navbar-middle">
      <div class="navbar-middle-left">
        <span class="trending-label">🔥 热门活动</span>
      </div>
      
      <div class="navbar-middle-categories">
        <button
          v-for="category in mainCategories"
          :key="category"
          :class="['category-btn', { active: activeMainCategory === category }]"
          @click="activeMainCategory = category"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- 第三行：标签导航（水平滚动） -->
    <div class="navbar-bottom">
      <div class="tags-scroll">
        <button
          v-for="tag in tagCategories"
          :key="tag"
          :class="['tag-btn', { active: activeTag === tag }]"
          @click="activeTag = tag"
        >
          {{ tag }}
        </button>
        <button class="tag-btn more-btn">
          更多 →
        </button>
      </div>

      <div class="navbar-actions">
        <button class="action-btn">🔍</button>
        <button class="action-btn">⚙️</button>
        <button class="action-btn">❤️</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useWalletStore } from '../stores/wallet'

const walletStore = useWalletStore()
const searchQuery = ref('')
const activeMainCategory = ref('实况')
const activeTag = ref('全部')

const mainCategories = [
  '实况',
  '实际',
  '新的',
  '政治',
  '运动的',
  '加密货币',
  '金融',
  '地缘政治',
  '收益',
  '科技',
  '文化',
  '世界',
  '经济',
  '气候与科学',
  '选举',
  '更多'
]

const tagCategories = [
  '全部',
  '主题',
  '币种',
  'NFL季后赛',
  '金球奖',
  '格陵兰三',
  '葡萄牙选举',
  '马克三',
  '爱沙斯坦',
  '阿尔及利亚',
  '美联储',
  '推特市场',
  '银',
  '中国',
  '人工智能'
]

const connectWallet = async () => {
  try {
    await walletStore.connectWallet()
  } catch (error) {
    console.error('连接钱包失败:', error)
  }
}

const toggleWalletMenu = () => {
  // 切换钱包菜单
  console.log('切换钱包菜单')
}

const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
}

const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
</script>

<style scoped>
.navbar {
  background-color: var(--color-dark-surface);
  border-bottom: 1px solid var(--color-dark-border);
  padding: 0;
}

/* 第一行 */
.navbar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-dark-border);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.navbar-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-purple-light);
  text-decoration: none;
  white-space: nowrap;
}

.navbar-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  max-width: 400px;
  padding: 0.5rem 1rem;
  background-color: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
}

.search-icon {
  font-size: 1rem;
}

.navbar-search input {
  flex: 1;
  background: none;
  border: none;
  color: #e5e7eb;
  font-size: 0.875rem;
  outline: none;
}

.navbar-search input::placeholder {
  color: #9ca3af;
}

.search-divider {
  color: #9ca3af;
  font-size: 0.875rem;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.balance-display {
  display: flex;
  gap: 1.5rem;
}

.balance-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.balance-label {
  font-size: 0.75rem;
  color: #9ca3af;
}

.balance-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-yes);
}

.balance-unit {
  font-size: 0.75rem;
  color: #9ca3af;
}

.navbar-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #e5e7eb;
  transition: color 0.3s ease;
}

.navbar-icon:hover {
  color: var(--color-purple-light);
}

.navbar-wallet {
  display: flex;
  align-items: center;
}

.btn-connect {
  padding: 0.5rem 1rem;
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.btn-connect:hover {
  background-color: var(--color-purple-light);
}

.wallet-menu-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  color: #e5e7eb;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.wallet-menu-btn:hover {
  border-color: var(--color-purple-primary);
  background-color: #3d2f52;
}

.wallet-avatar {
  font-size: 1rem;
}

.wallet-address {
  font-family: monospace;
  font-size: 0.75rem;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* 第二行 */
.navbar-middle {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--color-dark-border);
  overflow-x: auto;
}

.navbar-middle-left {
  white-space: nowrap;
}

.trending-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-purple-light);
}

.navbar-middle-categories {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1;
}

.navbar-middle-categories::-webkit-scrollbar {
  display: none;
}

.category-btn {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #9ca3af;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.category-btn:hover {
  color: var(--color-purple-light);
}

.category-btn.active {
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
}

/* 第三行 */
.navbar-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  overflow-x: auto;
}

.tags-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1;
}

.tags-scroll::-webkit-scrollbar {
  display: none;
}

.tag-btn {
  padding: 0.5rem 1rem;
  background-color: var(--color-dark-card);
  color: #9ca3af;
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.tag-btn:hover {
  border-color: var(--color-purple-primary);
  color: var(--color-purple-light);
}

.tag-btn.active {
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
  border-color: var(--color-purple-primary);
}

.more-btn {
  background-color: transparent;
  border: none;
}

.navbar-actions {
  display: flex;
  gap: 1rem;
  margin-left: 1rem;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #e5e7eb;
  transition: color 0.3s ease;
}

.action-btn:hover {
  color: var(--color-purple-light);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-top {
    flex-direction: column;
    gap: 1rem;
  }

  .navbar-left {
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }

  .navbar-search {
    width: 100%;
    max-width: 100%;
  }

  .navbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .balance-display {
    display: none;
  }

  .navbar-middle {
    flex-direction: column;
    align-items: flex-start;
  }

  .navbar-middle-categories {
    width: 100%;
  }
}
</style>

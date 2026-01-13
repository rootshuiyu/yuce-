<template>
  <div class="my-markets-page">
    <div class="page-header">
      <h1>我的市场</h1>
      <p class="subtitle">管理您创建的市场和审核状态</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-label">活跃市场</div>
          <div class="stat-value">{{ userMarkets.active.length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <div class="stat-label">待审核</div>
          <div class="stat-value">{{ userMarkets.pending.length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <div class="stat-label">已拒绝</div>
          <div class="stat-value">{{ userMarkets.rejected.length }}</div>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }} ({{ getTabCount(tab.id) }})
      </button>
    </div>

    <!-- 筛选和排序工具栏 -->
    <div class="toolbar">
      <div class="filter-group">
        <label for="sortBy">排序方式:</label>
        <select id="sortBy" v-model="sortBy" class="filter-select">
          <option value="newest">最新创建</option>
          <option value="oldest">最早创建</option>
          <option value="volume">交易量最高</option>
          <option value="endDate">即将结束</option>
        </select>
      </div>

      <div class="search-group">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索市场问题..."
          class="search-input"
        />
      </div>
    </div>

    <!-- 活跃市场 -->
    <div v-if="activeTab === 'active'" class="markets-section">
      <h2 class="section-title">活跃市场 ({{ filteredActiveMarkets.length }})</h2>
      <div v-if="filteredActiveMarkets.length > 0" class="markets-list">
        <div v-for="market in filteredActiveMarkets" :key="market.id" class="market-item">
          <div class="market-header">
            <h3 class="market-title">{{ market.question }}</h3>
            <span class="market-status active">活跃</span>
          </div>
          <div class="market-meta">
            <span class="meta-item">
              <span class="meta-label">分类:</span>
              <span class="meta-value">{{ market.subcategory }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">创建时间:</span>
              <span class="meta-value">{{ formatDate(market.createdAt) }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">结束时间:</span>
              <span class="meta-value">{{ formatDate(market.endDate) }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">交易量:</span>
              <span class="meta-value">${{ formatVolume(market.volume) }}</span>
            </span>
          </div>
          <div class="market-probability">
            <div class="prob-item">
              <span class="prob-label">YES</span>
              <div class="prob-bar">
                <div class="prob-fill yes" :style="{ width: (market.currentYesProb * 100) + '%' }"></div>
              </div>
              <span class="prob-value">{{ (market.currentYesProb * 100).toFixed(1) }}%</span>
            </div>
            <div class="prob-item">
              <span class="prob-label">NO</span>
              <div class="prob-bar">
                <div class="prob-fill no" :style="{ width: (market.currentNoProb * 100) + '%' }"></div>
              </div>
              <span class="prob-value">{{ (market.currentNoProb * 100).toFixed(1) }}%</span>
            </div>
          </div>
          <div class="market-actions">
            <router-link :to="`/market/${market.id}`" class="btn-view">查看详情</router-link>
            <button class="btn-edit">编辑</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">{{ searchQuery ? '搜索结果为空' : '暂无活跃市场' }}</div>
      </div>
    </div>

    <!-- 待审核市场 -->
    <div v-if="activeTab === 'pending'" class="markets-section">
      <h2 class="section-title">待审核市场 ({{ filteredPendingMarkets.length }})</h2>
      <div v-if="filteredPendingMarkets.length > 0" class="markets-list">
        <div v-for="market in filteredPendingMarkets" :key="market.id" class="market-item pending">
          <div class="market-header">
            <h3 class="market-title">{{ market.question }}</h3>
            <span class="market-status pending">待审核</span>
          </div>
          <div class="market-meta">
            <span class="meta-item">
              <span class="meta-label">分类:</span>
              <span class="meta-value">{{ market.subcategory }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">创建时间:</span>
              <span class="meta-value">{{ formatDate(market.createdAt) }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">等待时间:</span>
              <span class="meta-value">{{ getWaitingTime(market.createdAt) }}</span>
            </span>
          </div>
          <div class="pending-message">
            <span class="icon">⏳</span>
            <span class="text">您的市场正在等待管理员审核。通常需要 24-48 小时。</span>
          </div>
          <div class="market-actions">
            <button class="btn-edit">编辑</button>
            <button class="btn-cancel">取消申请</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">{{ searchQuery ? '搜索结果为空' : '暂无待审核市场' }}</div>
      </div>
    </div>

    <!-- 已拒绝市场 -->
    <div v-if="activeTab === 'rejected'" class="markets-section">
      <h2 class="section-title">已拒绝市场 ({{ filteredRejectedMarkets.length }})</h2>
      <div v-if="filteredRejectedMarkets.length > 0" class="markets-list">
        <div v-for="market in filteredRejectedMarkets" :key="market.id" class="market-item rejected">
          <div class="market-header">
            <h3 class="market-title">{{ market.question }}</h3>
            <span class="market-status rejected">已拒绝</span>
          </div>
          <div class="market-meta">
            <span class="meta-item">
              <span class="meta-label">分类:</span>
              <span class="meta-value">{{ market.subcategory }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">创建时间:</span>
              <span class="meta-value">{{ formatDate(market.createdAt) }}</span>
            </span>
          </div>
          <div class="rejection-message">
            <span class="icon">❌</span>
            <span class="text">拒绝原因：{{ market.rejectionReason || '未提供原因' }}</span>
          </div>
          <div class="market-actions">
            <button class="btn-edit">修改</button>
            <button class="btn-retry">重新提交</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">{{ searchQuery ? '搜索结果为空' : '暂无已拒绝市场' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '../stores/wallet'

const walletStore = useWalletStore()

const activeTab = ref('active')
const sortBy = ref('newest')
const searchQuery = ref('')
const userMarkets = ref({
  active: [],
  pending: [],
  rejected: []
})

const tabs = [
  { id: 'active', label: '活跃市场' },
  { id: 'pending', label: '待审核' },
  { id: 'rejected', label: '已拒绝' }
]

// 计算筛选和排序后的市场列表
const filteredActiveMarkets = computed(() => {
  return filterAndSort(userMarkets.value.active)
})

const filteredPendingMarkets = computed(() => {
  return filterAndSort(userMarkets.value.pending)
})

const filteredRejectedMarkets = computed(() => {
  return filterAndSort(userMarkets.value.rejected)
})

// 筛选和排序函数
const filterAndSort = (markets) => {
  let filtered = markets

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(m => 
      m.question.toLowerCase().includes(query) ||
      m.description?.toLowerCase().includes(query)
    )
  }

  // 排序
  const sorted = [...filtered]
  switch (sortBy.value) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'oldest':
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'volume':
      sorted.sort((a, b) => (b.volume || 0) - (a.volume || 0))
      break
    case 'endDate':
      sorted.sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      break
  }

  return sorted
}

const getTabCount = (tabId) => {
  return userMarkets.value[tabId]?.length || 0
}

const formatDate = (date) => {
  if (!date) return '未知'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatVolume = (volume) => {
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(1) + 'M'
  }
  if (volume >= 1000) {
    return (volume / 1000).toFixed(1) + 'K'
  }
  return volume.toFixed(0)
}

// 计算等待时间
const getWaitingTime = (createdAt) => {
  if (!createdAt) return '未知'
  const created = new Date(createdAt)
  const now = new Date()
  const hours = Math.floor((now - created) / (1000 * 60 * 60))
  
  if (hours < 1) {
    const minutes = Math.floor((now - created) / (1000 * 60))
    return `${minutes} 分钟前`
  }
  if (hours < 24) {
    return `${hours} 小时前`
  }
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

const fetchUserMarkets = async () => {
  try {
    if (!walletStore.address) {
      console.log('钱包未连接')
      return
    }

    const response = await fetch(`http://localhost:3000/api/markets/user/${walletStore.address}`)
    const data = await response.json()

    if (data.success) {
      userMarkets.value = data.data
    }
  } catch (error) {
    console.error('获取用户市场失败:', error)
  }
}

onMounted(() => {
  fetchUserMarkets()
})
</script>

<style scoped>
.my-markets-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #a78bfa;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #9ca3af;
  margin: 0;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  color: #a78bfa;
  font-size: 1.75rem;
  font-weight: 700;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
}

.tab {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: #9ca3af;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab:hover {
  color: #a78bfa;
}

.tab.active {
  color: #8b5cf6;
  border-bottom-color: #8b5cf6;
}

/* 工具栏 */
.toolbar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group,
.search-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-group label {
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
}

.filter-select,
.search-input {
  padding: 0.625rem 1rem;
  background: rgba(17, 12, 34, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  color: #e5e7eb;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-select:focus,
.search-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.search-input::placeholder {
  color: #6b7280;
}

/* 市场列表 */
.markets-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title {
  font-size: 1.25rem;
  color: #e5e7eb;
  margin-bottom: 1.5rem;
}

.markets-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.market-item {
  padding: 1.5rem;
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.market-item:hover {
  border-color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.market-title {
  flex: 1;
  color: #e5e7eb;
  font-size: 1.125rem;
  margin: 0;
  line-height: 1.4;
}

.market-status {
  padding: 0.375rem 0.875rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.market-status.active {
  background: rgba(34, 197, 94, 0.15);
  color: #86efac;
}

.market-status.pending {
  background: rgba(251, 191, 36, 0.15);
  color: #fcd34d;
}

.market-status.rejected {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}

.market-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
}

.meta-label {
  color: #9ca3af;
}

.meta-value {
  color: #e5e7eb;
  font-weight: 500;
}

.market-probability {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.prob-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.prob-label {
  color: #9ca3af;
  font-size: 0.875rem;
  min-width: 40px;
  font-weight: 600;
}

.prob-bar {
  flex: 1;
  height: 8px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.prob-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.prob-fill.yes {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.prob-fill.no {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.prob-value {
  color: #a78bfa;
  font-weight: 600;
  font-size: 0.875rem;
  min-width: 50px;
  text-align: right;
}

.pending-message,
.rejection-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.pending-message {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fcd34d;
}

.rejection-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.pending-message .icon,
.rejection-message .icon {
  font-size: 1.25rem;
}

.market-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-view,
.btn-edit,
.btn-cancel,
.btn-retry {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-view {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
}

.btn-view:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn-edit {
  background: transparent;
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.btn-edit:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
}

.btn-cancel {
  background: transparent;
  color: #9ca3af;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.btn-cancel:hover {
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-retry {
  background: transparent;
  color: #fcd34d;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.btn-retry:hover {
  background: rgba(251, 191, 36, 0.1);
  border-color: #fbbf24;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  color: #9ca3af;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group,
  .search-group {
    width: 100%;
  }

  .filter-select,
  .search-input {
    width: 100%;
  }

  .market-meta {
    gap: 1rem;
  }

  .market-probability {
    flex-direction: column;
    gap: 1rem;
  }

  .market-actions {
    flex-direction: column;
  }

  .btn-view,
  .btn-edit,
  .btn-cancel,
  .btn-retry {
    width: 100%;
  }
}
</style>

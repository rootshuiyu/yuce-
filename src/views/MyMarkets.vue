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

    <!-- 活跃市场 -->
    <div v-if="activeTab === 'active'" class="markets-section">
      <h2 class="section-title">活跃市场</h2>
      <div v-if="userMarkets.active.length > 0" class="markets-list">
        <div v-for="market in userMarkets.active" :key="market.id" class="market-item">
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
                <div class="prob-fill" :style="{ width: (market.initialYesProb * 100) + '%' }"></div>
              </div>
              <span class="prob-value">{{ (market.initialYesProb * 100).toFixed(0) }}%</span>
            </div>
            <div class="prob-item">
              <span class="prob-label">NO</span>
              <div class="prob-bar">
                <div class="prob-fill" :style="{ width: (market.initialNoProb * 100) + '%' }"></div>
              </div>
              <span class="prob-value">{{ (market.initialNoProb * 100).toFixed(0) }}%</span>
            </div>
          </div>
          <div class="market-actions">
            <button class="btn-view">查看详情</button>
            <button class="btn-edit">编辑</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">暂无活跃市场</div>
      </div>
    </div>

    <!-- 待审核市场 -->
    <div v-if="activeTab === 'pending'" class="markets-section">
      <h2 class="section-title">待审核市场</h2>
      <div v-if="userMarkets.pending.length > 0" class="markets-list">
        <div v-for="market in userMarkets.pending" :key="market.id" class="market-item pending">
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
          </div>
          <div class="pending-message">
            <span class="icon">⏳</span>
            <span class="text">您的市场正在等待管理员审核。通常需要 24-48 小时。</span>
          </div>
          <div class="market-actions">
            <button class="btn-cancel">取消申请</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">暂无待审核市场</div>
      </div>
    </div>

    <!-- 已拒绝市场 -->
    <div v-if="activeTab === 'rejected'" class="markets-section">
      <h2 class="section-title">已拒绝市场</h2>
      <div v-if="userMarkets.rejected.length > 0" class="markets-list">
        <div v-for="market in userMarkets.rejected" :key="market.id" class="market-item rejected">
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
              <span class="meta-label">拒绝原因:</span>
              <span class="meta-value">{{ market.rejectionReason }}</span>
            </span>
          </div>
          <div class="rejection-message">
            <span class="icon">❌</span>
            <span class="text">{{ market.rejectionReason }}</span>
          </div>
          <div class="market-actions">
            <button class="btn-retry">修改并重新提交</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">暂无已拒绝市场</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWalletStore } from '../stores/wallet'

const walletStore = useWalletStore()

const activeTab = ref('active')
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

const fetchUserMarkets = async () => {
  try {
    if (!walletStore.account) {
      console.log('钱包未连接')
      return
    }

    const response = await fetch(`/api/markets/user/markets?creator=${walletStore.account}`)
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
  color: var(--color-purple-light);
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
  background-color: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--color-purple-primary);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.1);
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
  color: var(--color-purple-light);
  font-size: 1.75rem;
  font-weight: 700;
}

/* 标签页 */
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--color-dark-border);
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
  color: var(--color-purple-light);
}

.tab.active {
  color: var(--color-purple-primary);
  border-bottom-color: var(--color-purple-primary);
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
  background-color: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.market-item:hover {
  border-color: var(--color-purple-primary);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.1);
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
}

.market-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.market-status.active {
  background-color: rgba(34, 197, 94, 0.1);
  color: #86efac;
}

.market-status.pending {
  background-color: rgba(234, 179, 8, 0.1);
  color: #fcd34d;
}

.market-status.rejected {
  background-color: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
}

.market-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
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
}

.prob-bar {
  flex: 1;
  height: 6px;
  background-color: var(--color-dark-bg);
  border-radius: 3px;
  overflow: hidden;
}

.prob-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-purple-primary), var(--color-purple-light));
  transition: width 0.3s ease;
}

.prob-value {
  color: var(--color-purple-light);
  font-weight: 600;
  font-size: 0.875rem;
  min-width: 40px;
  text-align: right;
}

.pending-message,
.rejection-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.pending-message {
  background-color: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
  color: #fcd34d;
}

.rejection-message {
  background-color: rgba(239, 68, 68, 0.1);
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
}

.btn-view,
.btn-edit,
.btn-cancel,
.btn-retry {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  background-color: var(--color-dark-bg);
  color: #e5e7eb;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view:hover,
.btn-edit:hover {
  border-color: var(--color-purple-primary);
  color: var(--color-purple-light);
}

.btn-cancel:hover,
.btn-retry:hover {
  border-color: var(--color-purple-primary);
  color: var(--color-purple-light);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #9ca3af;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}
</style>

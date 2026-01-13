<template>
  <div class="home-page">
    <!-- 加载状态 -->
    <div v-if="marketStore.loading" class="loading-container">
      <div class="spinner"></div>
      <p>加载市场中...</p>
    </div>

    <!-- 市场网格视图 -->
    <div v-else-if="filteredMarkets.length > 0 && viewMode === 'grid'" class="markets-container">
      <div class="markets-grid">
        <div
          v-for="market in filteredMarkets"
          :key="market.id"
          class="market-card"
          @click="goToMarket(market.id)"
        >
          <!-- 市场头部 -->
          <div class="card-header">
            <div class="market-title">{{ market.question }}</div>
            <div class="card-meta">
              <span class="category">{{ market.subcategory }}</span>
              <span class="end-date">{{ formatDate(market.endDate) }}</span>
            </div>
          </div>

          <!-- 概率显示 -->
          <div class="probability-display">
            <div class="prob-row">
              <span class="prob-label yes">✓ YES</span>
              <div class="prob-bar">
                <div
                  class="prob-fill yes"
                  :style="{ width: (market.impliedProbability?.yes * 100 || 50) + '%' }"
                ></div>
              </div>
              <span class="prob-value">{{ (market.impliedProbability?.yes * 100 || 50).toFixed(0) }}%</span>
            </div>
            <div class="prob-row">
              <span class="prob-label no">✗ NO</span>
              <div class="prob-bar">
                <div
                  class="prob-fill no"
                  :style="{ width: (market.impliedProbability?.no * 100 || 50) + '%' }"
                ></div>
              </div>
              <span class="prob-value">{{ (market.impliedProbability?.no * 100 || 50).toFixed(0) }}%</span>
            </div>
          </div>

          <!-- 交易按钮 -->
          <div class="card-actions" @click.stop>
            <button class="btn-yes" @click="openTradeModal(market, 'yes')">
              YES
            </button>
            <button class="btn-no" @click="openTradeModal(market, 'no')">
              NO
            </button>
          </div>

          <!-- 卡片底部 -->
          <div class="card-footer">
            <div class="footer-item">
              <span class="label">交易量</span>
              <span class="value">💰 ${{ formatVolume(market.totalVolume) }}</span>
            </div>
            <div class="footer-item">
              <span class="label">交易者</span>
              <span class="value">👥 {{ market.traders }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 市场列表视图 -->
    <div v-else-if="filteredMarkets.length > 0 && viewMode === 'list'" class="markets-list-container">
      <table class="markets-table">
        <thead>
          <tr>
            <th class="col-question">问题</th>
            <th class="col-probability">概率</th>
            <th class="col-volume">交易量</th>
            <th class="col-traders">交易者</th>
            <th class="col-end-date">结束时间</th>
            <th class="col-action">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="market in filteredMarkets" :key="market.id" class="market-row" @click="goToMarket(market.id)">
            <td class="col-question">
              <div class="question-cell">
                <div class="question-text">{{ market.question }}</div>
                <div class="question-meta">{{ market.subcategory }}</div>
              </div>
            </td>
            <td class="col-probability">
              <div class="probability-cell">
                <span class="yes-prob">
                  <span class="yes-badge">YES</span>
                  {{ (market.impliedProbability?.yes * 100 || 50).toFixed(0) }}%
                </span>
                <span class="no-prob">
                  <span class="no-badge">NO</span>
                  {{ (market.impliedProbability?.no * 100 || 50).toFixed(0) }}%
                </span>
              </div>
            </td>
            <td class="col-volume">
              <span class="volume-value">${{ formatVolume(market.totalVolume) }}</span>
            </td>
            <td class="col-traders">
              <span class="traders-value">{{ market.traders }}</span>
            </td>
            <td class="col-end-date">
              <span class="end-date-value">{{ formatDate(market.endDate) }}</span>
            </td>
            <td class="col-action" @click.stop>
              <button class="btn-trade" @click="openTradeModal(market, 'yes')">交易</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📊</div>
      <div class="empty-text">暂无市场</div>
      <div class="empty-hint">点击左侧分类或使用搜索功能查找市场</div>
    </div>

    <!-- 交易模态框 -->
    <TradeModal
      v-if="selectedMarket"
      :market="selectedMarket"
      :side="selectedSide"
      @close="selectedMarket = null"
      @trade="handleTrade"
    />

    <!-- 创建市场模态框 -->
    <CreateMarketModal
      :is-open="showCreateMarketModal"
      @close="showCreateMarketModal = false"
      @success="handleMarketCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '../stores/market'
import { useWalletStore } from '../stores/wallet'
import TradeModal from '../components/TradeModal.vue'
import CreateMarketModal from '../components/CreateMarketModal.vue'

const router = useRouter()
const marketStore = useMarketStore()
const walletStore = useWalletStore()

const showCreateMarketModal = ref(false)
const selectedMarket = ref(null)
const selectedSide = ref(null)

// 从 App.vue 传入的 props
const props = defineProps({
  selectedPrimaryCategory: {
    type: String,
    default: 'all'
  },
  selectedSubcategory: {
    type: String,
    default: null
  },
  sortBy: {
    type: String,
    default: 'volume'
  },
  statusFilter: {
    type: String,
    default: 'all'
  },
  viewMode: {
    type: String,
    default: 'grid'
  }
})

// 过滤和排序的市场列表
const filteredMarkets = computed(() => {
  let result = marketStore.markets

  // 按一级分类过滤
  if (props.selectedPrimaryCategory !== 'all') {
    result = result.filter(m => m.categoryId === props.selectedPrimaryCategory)
  }

  // 按二级分类过滤
  if (props.selectedSubcategory) {
    result = result.filter(m => m.subcategory === props.selectedSubcategory || m.subcategoryId === props.selectedSubcategory)
  }

  // 按状态过滤
  if (props.statusFilter !== 'all') {
    result = result.filter(m => m.status === props.statusFilter)
  }

  // 排序
  if (props.sortBy === 'volume') {
    result.sort((a, b) => b.totalVolume - a.totalVolume)
  } else if (props.sortBy === 'probability') {
    result.sort((a, b) => (b.impliedProbability?.yes || 0) - (a.impliedProbability?.yes || 0))
  } else if (props.sortBy === 'newest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return result
})

const goToMarket = (marketId) => {
  router.push(`/market/${marketId}`)
}

const openTradeModal = (market, side) => {
  selectedMarket.value = market
  selectedSide.value = side
}

const handleTrade = async (tradeData) => {
  console.log('交易:', tradeData)
  selectedMarket.value = null
}

const handleCreateMarketClick = () => {
  if (!walletStore.isConnected) {
    alert('请先连接钱包')
    return
  }
  showCreateMarketModal.value = true
}

const handleMarketCreated = () => {
  // 市场创建成功，刷新市场列表
  marketStore.fetchMarkets()
}

const formatDate = (date) => {
  if (!date) return '未知'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
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

onMounted(() => {
  marketStore.fetchMarkets()
})
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  overflow: hidden;
}

/* ===== 网格视图 ===== */
.markets-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.markets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding-right: 0.5rem;
}

/* 市场卡片 */
.market-card {
  background-color: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.5rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 360px;
}

.market-card:hover {
  border-color: var(--color-purple-primary);
  background-color: #3d2f52;
  box-shadow: 0 8px 16px rgba(167, 139, 250, 0.15);
  transform: translateY(-4px);
}

.card-header {
  flex: 0;
}

.market-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-purple-light);
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9ca3af;
  gap: 0.5rem;
}

.category {
  background-color: var(--color-dark-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

/* 概率显示 */
.probability-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.prob-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.prob-label {
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 50px;
}

.prob-label.yes {
  color: var(--color-yes);
}

.prob-label.no {
  color: var(--color-no);
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
  transition: width 0.3s ease;
}

.prob-fill.yes {
  background-color: var(--color-yes);
}

.prob-fill.no {
  background-color: var(--color-no);
}

.prob-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #e5e7eb;
  min-width: 40px;
  text-align: right;
}

/* 交易按钮 */
.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  flex: 0;
}

.btn-yes,
.btn-no {
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-yes {
  background-color: var(--color-yes);
  color: white;
}

.btn-yes:hover {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-no {
  background-color: var(--color-no);
  color: white;
}

.btn-no:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-dark-border);
  flex: 0;
}

.footer-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.footer-item .label {
  font-size: 0.7rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-item .value {
  font-size: 0.875rem;
  color: #e5e7eb;
  font-weight: 600;
}

/* ===== 列表视图 ===== */
.markets-list-container {
  flex: 1;
  overflow: auto;
}

.markets-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.markets-table thead {
  position: sticky;
  top: 0;
  background-color: var(--color-dark-card);
  border-bottom: 2px solid var(--color-dark-border);
  z-index: 10;
}

.markets-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.market-row {
  border-bottom: 1px solid var(--color-dark-border);
  transition: all 0.3s ease;
  cursor: pointer;
}

.market-row:hover {
  background-color: #3d2f52;
  border-bottom-color: var(--color-purple-primary);
}

.markets-table td {
  padding: 1rem 0.75rem;
  color: #e5e7eb;
}

.col-question {
  width: 40%;
}

.col-probability {
  width: 20%;
}

.col-volume {
  width: 15%;
}

.col-traders {
  width: 10%;
}

.col-end-date {
  width: 10%;
}

.col-action {
  width: 5%;
}

.question-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.question-text {
  font-weight: 500;
  color: var(--color-purple-light);
}

.question-meta {
  font-size: 0.75rem;
  color: #9ca3af;
}

.probability-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.yes-prob,
.no-prob {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.yes-badge,
.no-badge {
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
}

.yes-badge {
  background-color: rgba(16, 185, 129, 0.2);
  color: var(--color-yes);
}

.no-badge {
  background-color: rgba(239, 68, 68, 0.2);
  color: var(--color-no);
}

.volume-value,
.traders-value,
.end-date-value {
  font-weight: 500;
}

.btn-trade {
  padding: 0.5rem 1rem;
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-trade:hover {
  background-color: var(--color-purple-light);
  transform: translateY(-2px);
}

/* ===== 加载状态 ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--color-dark-border);
  border-top-color: var(--color-purple-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e5e7eb;
}

.empty-hint {
  font-size: 0.875rem;
  color: #9ca3af;
}

/* ===== 响应式设计 ===== */
@media (max-width: 1024px) {
  .markets-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .market-card {
    padding: 1rem;
    min-height: 340px;
  }

  .market-title {
    font-size: 0.95rem;
  }

  .col-question {
    width: 35%;
  }

  .col-probability {
    width: 25%;
  }

  .col-volume {
    width: 15%;
  }

  .col-traders {
    width: 12%;
  }

  .col-end-date {
    width: 10%;
  }

  .col-action {
    width: 3%;
  }
}

@media (max-width: 768px) {
  .markets-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem;
  }

  .market-card {
    padding: 0.875rem;
    min-height: 320px;
  }

  .market-title {
    font-size: 0.9rem;
  }

  .card-meta {
    font-size: 0.7rem;
  }

  .prob-label {
    font-size: 0.8rem;
    min-width: 45px;
  }

  .prob-value {
    font-size: 0.8rem;
  }

  .btn-yes,
  .btn-no {
    padding: 0.625rem;
    font-size: 0.8rem;
  }

  .markets-table {
    font-size: 0.8rem;
  }

  .markets-table th,
  .markets-table td {
    padding: 0.625rem;
  }

  .col-question {
    width: 30%;
  }

  .col-probability {
    width: 25%;
  }

  .col-volume {
    width: 15%;
  }

  .col-traders {
    display: none;
  }

  .col-end-date {
    width: 15%;
  }

  .col-action {
    width: 5%;
  }
}

@media (max-width: 480px) {
  .markets-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .market-card {
    padding: 0.75rem;
    min-height: 300px;
  }

  .market-title {
    font-size: 0.85rem;
  }

  .card-meta {
    font-size: 0.65rem;
  }

  .prob-label {
    font-size: 0.75rem;
    min-width: 40px;
  }

  .prob-value {
    font-size: 0.75rem;
  }

  .btn-yes,
  .btn-no {
    padding: 0.5rem;
    font-size: 0.75rem;
  }

  .markets-table {
    font-size: 0.75rem;
  }

  .markets-table th,
  .markets-table td {
    padding: 0.5rem;
  }

  .col-question {
    width: 50%;
  }

  .col-probability {
    display: none;
  }

  .col-volume {
    width: 20%;
  }

  .col-traders {
    display: none;
  }

  .col-end-date {
    width: 20%;
  }

  .col-action {
    width: 10%;
  }

  .question-text {
    font-size: 0.8rem;
  }

  .question-meta {
    font-size: 0.65rem;
  }
}
</style>

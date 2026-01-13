<template>
  <div class="home-page">
    <!-- 搜索和过滤栏 -->
    <div class="search-filter-bar">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索市场..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>

      <div class="filter-controls">
        <select v-model="sortBy" class="filter-select">
          <option value="newest">最新</option>
          <option value="volume">交易量</option>
          <option value="probability">概率</option>
        </select>

        <button
          :class="['view-toggle', { active: viewMode === 'grid' }]"
          @click="viewMode = 'grid'"
          title="网格视图"
        >
          ⊞
        </button>
        <button
          :class="['view-toggle', { active: viewMode === 'list' }]"
          @click="viewMode = 'list'"
          title="列表视图"
        >
          ≡
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="marketStore.loading" class="loading-container">
      <div class="spinner"></div>
      <p>加载市场中...</p>
    </div>

    <!-- 网格视图 -->
    <div v-else-if="filteredMarkets.length > 0 && viewMode === 'grid'" class="markets-container">
      <div class="markets-grid">
        <PolymartketMarketCard
          v-for="market in filteredMarkets"
          :key="market.id"
          :market="market"
          @click="goToMarket(market.id)"
          @trade="openTradeModal(market, $event)"
        />
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="filteredMarkets.length > 0 && viewMode === 'list'" class="markets-list-container">
      <table class="markets-table">
        <thead>
          <tr>
            <th>市场</th>
            <th>YES</th>
            <th>NO</th>
            <th>交易量</th>
            <th>交易者</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="market in filteredMarkets" :key="market.id" class="market-row">
            <td class="market-info">
              <div class="market-title-cell">{{ market.question }}</div>
              <div class="market-category">{{ market.subcategory }}</div>
            </td>
            <td class="probability-cell yes">{{ (market.currentYesProb * 100).toFixed(0) }}%</td>
            <td class="probability-cell no">{{ (market.currentNoProb * 100).toFixed(0) }}%</td>
            <td class="volume-cell">${{ formatVolume(market.volume) }}</td>
            <td class="traders-cell">{{ market.traders }}</td>
            <td class="action-cell">
              <button class="btn-trade-small yes" @click="openTradeModal(market, 'yes')">
                Buy YES
              </button>
              <button class="btn-trade-small no" @click="openTradeModal(market, 'no')">
                Buy NO
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>没有找到市场</h3>
      <p>尝试调整搜索条件或分类过滤</p>
    </div>

    <!-- 交易模态框 -->
    <TradeModal
      v-if="selectedMarket"
      :market="selectedMarket"
      :side="selectedSide"
      @close="selectedMarket = null"
      @trade="handleTrade"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '../stores/market'
import { useWalletStore } from '../stores/wallet'
import PolymartketMarketCard from '../components/PolymartketMarketCard.vue'
import TradeModal from '../components/TradeModal.vue'

const router = useRouter()
const marketStore = useMarketStore()
const walletStore = useWalletStore()

const viewMode = ref('grid')
const sortBy = ref('newest')
const searchQuery = ref('')
const selectedMarket = ref(null)
const selectedSide = ref(null)

const filteredMarkets = computed(() => {
  let result = marketStore.markets || []

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m =>
      m.question.toLowerCase().includes(query) ||
      m.description?.toLowerCase().includes(query) ||
      m.subcategory?.toLowerCase().includes(query)
    )
  }

  // 排序
  if (sortBy.value === 'volume') {
    result.sort((a, b) => (b.volume || 0) - (a.volume || 0))
  } else if (sortBy.value === 'probability') {
    result.sort((a, b) => (b.currentYesProb || 0) - (a.currentYesProb || 0))
  } else if (sortBy.value === 'newest') {
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

const handleTrade = () => {
  selectedMarket.value = null
  marketStore.fetchMarkets()
}

const formatVolume = (volume) => {
  if (!volume) return '0'
  if (volume >= 1000000) return (volume / 1000000).toFixed(1) + 'M'
  if (volume >= 1000) return (volume / 1000).toFixed(1) + 'K'
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

/* 搜索和过滤栏 */
.search-filter-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: rgba(168, 85, 247, 0.05);
  border-radius: 0.75rem;
  border: 1px solid var(--color-dark-border);
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.5rem;
  color: #e5e7eb;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-purple-primary);
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-select {
  padding: 0.625rem 0.875rem;
  background: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  color: #e5e7eb;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover,
.filter-select:focus {
  border-color: var(--color-purple-primary);
}

.view-toggle {
  padding: 0.625rem 0.875rem;
  background: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.view-toggle.active {
  background: var(--color-purple-primary);
  border-color: var(--color-purple-primary);
  color: white;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex: 1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(168, 85, 247, 0.2);
  border-top-color: var(--color-purple-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 市场容器 */
.markets-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.markets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding-right: 0.5rem;
}

/* 列表视图 */
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
  background: rgba(168, 85, 247, 0.05);
  border-bottom: 1px solid var(--color-dark-border);
  position: sticky;
  top: 0;
}

.markets-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #d1d5db;
}

.markets-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-dark-border);
  color: #e5e7eb;
}

.market-row:hover {
  background: rgba(168, 85, 247, 0.05);
}

.market-info {
  flex: 1;
}

.market-title-cell {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.market-category {
  font-size: 0.75rem;
  color: #9ca3af;
}

.probability-cell {
  font-weight: 600;
  text-align: center;
}

.probability-cell.yes {
  color: #86efac;
}

.probability-cell.no {
  color: #fca5a5;
}

.volume-cell,
.traders-cell {
  text-align: right;
  color: #9ca3af;
}

.action-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-trade-small {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.btn-trade-small.yes {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.btn-trade-small.yes:hover {
  background: rgba(34, 197, 94, 0.3);
}

.btn-trade-small.no {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.btn-trade-small.no:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex: 1;
  color: #9ca3af;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #d1d5db;
  margin: 0;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-filter-bar {
    flex-direction: column;
    gap: 0.75rem;
  }

  .filter-controls {
    width: 100%;
    justify-content: space-between;
  }

  .markets-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .markets-table {
    font-size: 0.75rem;
  }

  .markets-table th,
  .markets-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>

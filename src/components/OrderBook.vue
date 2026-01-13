<template>
  <div class="orderbook-container">
    <!-- 标题和控制 -->
    <div class="orderbook-header">
      <h3>订单簿</h3>
      <div class="controls">
        <button 
          :class="['view-btn', { active: viewMode === 'depth' }]"
          @click="viewMode = 'depth'"
          title="深度图"
        >
          📊
        </button>
        <button 
          :class="['view-btn', { active: viewMode === 'list' }]"
          @click="viewMode = 'list'"
          title="列表"
        >
          📋
        </button>
        <button 
          @click="refreshOrderBook"
          :disabled="isLoading"
          title="刷新"
        >
          🔄
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <span class="spinner"></span>
      加载中...
    </div>

    <!-- 深度图视图 -->
    <div v-else-if="viewMode === 'depth'" class="depth-view">
      <!-- 卖单部分 -->
      <div class="depth-section sell">
        <div class="depth-title">卖单 (NO)</div>
        <div class="depth-bars">
          <div 
            v-for="(order, index) in sortedSellOrders.slice(0, 5)"
            :key="`sell-${index}`"
            class="depth-bar"
          >
            <div class="depth-info">
              <span class="price">{{ (order.price * 100).toFixed(0) }}¢</span>
              <span class="quantity">{{ order.quantity }}</span>
            </div>
            <div class="depth-bar-fill sell" :style="{ width: getBarWidth(order.quantity) }"></div>
          </div>
        </div>
      </div>

      <!-- 价格中线 -->
      <div class="price-line">
        <div class="current-price">
          <span class="label">当前价格</span>
          <span class="price">{{ (currentPrice * 100).toFixed(0) }}¢</span>
        </div>
      </div>

      <!-- 买单部分 -->
      <div class="depth-section buy">
        <div class="depth-title">买单 (YES)</div>
        <div class="depth-bars">
          <div 
            v-for="(order, index) in sortedBuyOrders.slice(0, 5)"
            :key="`buy-${index}`"
            class="depth-bar"
          >
            <div class="depth-info">
              <span class="price">{{ (order.price * 100).toFixed(0) }}¢</span>
              <span class="quantity">{{ order.quantity }}</span>
            </div>
            <div class="depth-bar-fill buy" :style="{ width: getBarWidth(order.quantity) }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="list-view">
      <!-- 卖单表格 -->
      <div class="table-section">
        <h4 class="table-title sell">卖单 (NO)</h4>
        <table class="orderbook-table">
          <thead>
            <tr>
              <th>价格</th>
              <th>数量</th>
              <th>总计</th>
              <th>交易者</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(order, index) in sortedSellOrders.slice(0, 10)"
              :key="`sell-${index}`"
              class="sell-row"
            >
              <td class="price">{{ (order.price * 100).toFixed(0) }}¢</td>
              <td class="quantity">{{ order.quantity }}</td>
              <td class="total">{{ (order.price * order.quantity).toFixed(2) }}</td>
              <td class="trader">{{ formatAddress(order.trader) }}</td>
            </tr>
            <tr v-if="sortedSellOrders.length === 0" class="empty-row">
              <td colspan="4">暂无卖单</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 买单表格 -->
      <div class="table-section">
        <h4 class="table-title buy">买单 (YES)</h4>
        <table class="orderbook-table">
          <thead>
            <tr>
              <th>价格</th>
              <th>数量</th>
              <th>总计</th>
              <th>交易者</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(order, index) in sortedBuyOrders.slice(0, 10)"
              :key="`buy-${index}`"
              class="buy-row"
            >
              <td class="price">{{ (order.price * 100).toFixed(0) }}¢</td>
              <td class="quantity">{{ order.quantity }}</td>
              <td class="total">{{ (order.price * order.quantity).toFixed(2) }}</td>
              <td class="trader">{{ formatAddress(order.trader) }}</td>
            </tr>
            <tr v-if="sortedBuyOrders.length === 0" class="empty-row">
              <td colspan="4">暂无买单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="orderbook-stats">
      <div class="stat-item">
        <span class="label">买单总量</span>
        <span class="value">{{ totalBuyQuantity }}</span>
      </div>
      <div class="stat-item">
        <span class="label">卖单总量</span>
        <span class="value">{{ totalSellQuantity }}</span>
      </div>
      <div class="stat-item">
        <span class="label">买卖比</span>
        <span class="value">{{ buyToSellRatio.toFixed(2) }}</span>
      </div>
      <div class="stat-item">
        <span class="label">订单总数</span>
        <span class="value">{{ buyOrders.length + sellOrders.length }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';

export default {
  name: 'OrderBook',
  props: {
    marketId: {
      type: String,
      required: true
    },
    currentPrice: {
      type: Number,
      default: 0.5
    }
  },
  setup(props) {
    const buyOrders = ref([]);
    const sellOrders = ref([]);
    const isLoading = ref(false);
    const viewMode = ref('depth');
    let refreshInterval = null;

    const sortedBuyOrders = computed(() => {
      return [...buyOrders.value].sort((a, b) => b.price - a.price);
    });

    const sortedSellOrders = computed(() => {
      return [...sellOrders.value].sort((a, b) => a.price - b.price);
    });

    const totalBuyQuantity = computed(() => {
      return buyOrders.value.reduce((sum, order) => sum + order.quantity, 0);
    });

    const totalSellQuantity = computed(() => {
      return sellOrders.value.reduce((sum, order) => sum + order.quantity, 0);
    });

    const buyToSellRatio = computed(() => {
      return totalSellQuantity.value > 0 ? totalBuyQuantity.value / totalSellQuantity.value : 0;
    });

    const getBarWidth = (quantity) => {
      const maxQuantity = Math.max(
        ...buyOrders.value.map(o => o.quantity),
        ...sellOrders.value.map(o => o.quantity),
        1
      );
      return `${(quantity / maxQuantity) * 100}%`;
    };

    const formatAddress = (address) => {
      if (!address) return 'Unknown';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const fetchOrderBook = async () => {
      isLoading.value = true;
      try {
        const response = await fetch(`/api/trades/orderbook/${props.marketId}`);
        const data = await response.json();

        if (data.success) {
          buyOrders.value = data.buyOrders || [];
          sellOrders.value = data.sellOrders || [];
        }
      } catch (err) {
        console.error('Failed to fetch orderbook:', err);
      } finally {
        isLoading.value = false;
      }
    };

    const refreshOrderBook = () => {
      fetchOrderBook();
    };

    onMounted(() => {
      fetchOrderBook();
      // 每 2 秒刷新一次订单簿
      refreshInterval = setInterval(fetchOrderBook, 2000);
    });

    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    });

    return {
      buyOrders,
      sellOrders,
      isLoading,
      viewMode,
      sortedBuyOrders,
      sortedSellOrders,
      totalBuyQuantity,
      totalSellQuantity,
      buyToSellRatio,
      getBarWidth,
      formatAddress,
      refreshOrderBook
    };
  }
};
</script>

<style scoped>
.orderbook-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(147, 112, 219, 0.2);
}

.orderbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(147, 112, 219, 0.1);
}

.orderbook-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #e0e7ff;
}

.controls {
  display: flex;
  gap: 8px;
}

.view-btn,
.controls button {
  padding: 8px 12px;
  background: rgba(147, 112, 219, 0.1);
  border: 1px solid rgba(147, 112, 219, 0.2);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn:hover,
.controls button:hover:not(:disabled) {
  background: rgba(147, 112, 219, 0.2);
  color: #e0e7ff;
  border-color: #9370db;
}

.view-btn.active {
  background: rgba(147, 112, 219, 0.3);
  color: #e0e7ff;
  border-color: #9370db;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #a0aec0;
  font-size: 14px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(147, 112, 219, 0.2);
  border-top-color: #9370db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 深度图视图 */
.depth-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.depth-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.depth-title {
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.depth-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.depth-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.depth-info {
  display: flex;
  gap: 16px;
  min-width: 100px;
  font-size: 12px;
}

.depth-info .price {
  color: #e0e7ff;
  font-weight: 600;
  min-width: 40px;
}

.depth-info .quantity {
  color: #a0aec0;
}

.depth-bar-fill {
  flex: 1;
  height: 24px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.depth-bar-fill.buy {
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.depth-bar-fill.sell {
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.depth-bar:hover .depth-bar-fill {
  opacity: 1;
}

.price-line {
  padding: 16px;
  background: rgba(147, 112, 219, 0.1);
  border: 1px solid rgba(147, 112, 219, 0.2);
  border-radius: 8px;
  text-align: center;
}

.current-price {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.current-price .label {
  font-size: 12px;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.current-price .price {
  font-size: 24px;
  font-weight: 700;
  color: #9370db;
}

/* 列表视图 */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.table-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 0;
}

.table-title.sell {
  color: #fca5a5;
}

.table-title.buy {
  color: #86efac;
}

.orderbook-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.orderbook-table thead {
  background: rgba(147, 112, 219, 0.05);
  border-bottom: 1px solid rgba(147, 112, 219, 0.1);
}

.orderbook-table th {
  padding: 10px 12px;
  text-align: left;
  color: #cbd5e1;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.orderbook-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(147, 112, 219, 0.05);
  color: #a0aec0;
}

.orderbook-table .price {
  color: #e0e7ff;
  font-weight: 600;
}

.orderbook-table .quantity {
  color: #cbd5e1;
}

.orderbook-table .total {
  color: #a0aec0;
}

.orderbook-table .trader {
  color: #9370db;
  font-family: monospace;
  font-size: 11px;
}

.sell-row:hover {
  background: rgba(239, 68, 68, 0.05);
}

.buy-row:hover {
  background: rgba(16, 185, 129, 0.05);
}

.empty-row {
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.empty-row:hover {
  background: transparent;
}

/* 统计信息 */
.orderbook-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(147, 112, 219, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(147, 112, 219, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(147, 112, 219, 0.1);
}

.stat-item .label {
  font-size: 11px;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #e0e7ff;
}

@media (max-width: 768px) {
  .orderbook-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .orderbook-table {
    font-size: 11px;
  }

  .orderbook-table th,
  .orderbook-table td {
    padding: 8px 10px;
  }
}
</style>

<template>
  <div class="portfolio-container">
    <!-- 选项卡 -->
    <div class="tabs">
      <button 
        :class="['tab', { active: activeTab === 'holdings' }]"
        @click="activeTab = 'holdings'"
      >
        <span class="tab-icon">💼</span>
        <span>我的持仓</span>
      </button>
      <button 
        :class="['tab', { active: activeTab === 'trades' }]"
        @click="activeTab = 'trades'"
      >
        <span class="tab-icon">📊</span>
        <span>交易历史</span>
      </button>
      <button 
        :class="['tab', { active: activeTab === 'orders' }]"
        @click="activeTab = 'orders'"
      >
        <span class="tab-icon">📋</span>
        <span>我的订单</span>
      </button>
    </div>

    <!-- 持仓部分 -->
    <div v-if="activeTab === 'holdings'" class="tab-content">
      <div v-if="isLoading" class="loading">
        <span class="spinner"></span>
        加载中...
      </div>
      <div v-else-if="holdings.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无持仓</p>
      </div>
      <div v-else class="holdings-grid">
        <div 
          v-for="holding in holdings"
          :key="`${holding.marketId}-${holding.tokenType}`"
          class="holding-card"
        >
          <div class="holding-header">
            <span class="market-id">{{ holding.marketId }}</span>
            <span :class="['token-type', holding.tokenType]">
              {{ holding.tokenType === 'yes' ? 'YES' : 'NO' }}
            </span>
          </div>
          <div class="holding-body">
            <div class="holding-stat">
              <span class="label">持仓数量</span>
              <span class="value">{{ holding.quantity }}</span>
            </div>
            <div class="holding-stat">
              <span class="label">当前价值</span>
              <span class="value">{{ (holding.quantity * getHoldingPrice(holding)).toFixed(2) }} USDC</span>
            </div>
            <div class="holding-stat">
              <span class="label">收益率</span>
              <span :class="['value', getReturnClass(holding)]">
                {{ getReturnPercent(holding).toFixed(2) }}%
              </span>
            </div>
          </div>
          <div class="holding-footer">
            <button class="action-btn sell" @click="sellHolding(holding)">卖出</button>
            <button class="action-btn transfer" @click="transferHolding(holding)">转账</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 交易历史部分 -->
    <div v-if="activeTab === 'trades'" class="tab-content">
      <div v-if="isLoading" class="loading">
        <span class="spinner"></span>
        加载中...
      </div>
      <div v-else-if="trades.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无交易</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="trades-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>市场</th>
              <th>类型</th>
              <th>价格</th>
              <th>数量</th>
              <th>总计</th>
              <th>对方</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(trade, index) in trades"
              :key="`trade-${index}`"
              :class="['trade-row', getTradeType(trade)]"
            >
              <td class="time">{{ formatTime(trade.createdAt) }}</td>
              <td class="market">{{ trade.marketId }}</td>
              <td class="type">
                <span :class="['badge', getTradeType(trade)]">
                  {{ getTradeType(trade) === 'buy' ? '买入' : '卖出' }}
                </span>
              </td>
              <td class="price">{{ (trade.price * 100).toFixed(0) }}¢</td>
              <td class="quantity">{{ trade.quantity }}</td>
              <td class="total">{{ (trade.price * trade.quantity).toFixed(2) }}</td>
              <td class="counterparty">{{ formatAddress(getCounterparty(trade)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 我的订单部分 -->
    <div v-if="activeTab === 'orders'" class="tab-content">
      <div v-if="isLoading" class="loading">
        <span class="spinner"></span>
        加载中...
      </div>
      <div v-else-if="orders.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无订单</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="orders-table">
          <thead>
            <tr>
              <th>订单 ID</th>
              <th>市场</th>
              <th>方向</th>
              <th>价格</th>
              <th>数量</th>
              <th>已成交</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="order in orders"
              :key="order.id"
              :class="['order-row', order.status]"
            >
              <td class="order-id">{{ formatOrderId(order.id) }}</td>
              <td class="market">{{ order.marketId }}</td>
              <td class="side">
                <span :class="['badge', order.side]">
                  {{ order.side === 'buy' ? '买入' : '卖出' }}
                </span>
              </td>
              <td class="price">{{ (order.price * 100).toFixed(0) }}¢</td>
              <td class="quantity">{{ order.quantity }}</td>
              <td class="filled">{{ order.filled || 0 }}/{{ order.quantity }}</td>
              <td class="status">
                <span :class="['status-badge', order.status]">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="actions">
                <button 
                  v-if="order.status === 'open'"
                  class="cancel-btn"
                  @click="cancelOrder(order.id)"
                >
                  取消
                </button>
                <span v-else class="no-action">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWalletStore } from '../stores/wallet';
import { useWebSocketStore } from '../stores/websocket';

export default {
  name: 'PortfolioAndHistory',
  props: {
    marketId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const walletStore = useWalletStore();
    const wsStore = useWebSocketStore();
    const activeTab = ref('holdings');
    const holdings = ref([]);
    const trades = ref([]);
    const orders = ref([]);
    const isLoading = ref(false);
    let refreshInterval = null;

    const getHoldingPrice = (holding) => {
      // 这里应该从市场数据中获取当前价格
      return holding.tokenType === 'yes' ? 0.5 : 0.5;
    };

    const getReturnPercent = (holding) => {
      // 这里应该计算实际的收益率
      return Math.random() * 20 - 10; // 示例数据
    };

    const getReturnClass = (holding) => {
      const returnPercent = getReturnPercent(holding);
      return returnPercent > 0 ? 'positive' : returnPercent < 0 ? 'negative' : 'neutral';
    };

    const getTradeType = (trade) => {
      // 根据当前用户地址判断是买入还是卖出
      return trade.buyerId === walletStore.address ? 'buy' : 'sell';
    };

    const getCounterparty = (trade) => {
      return trade.buyerId === walletStore.address ? trade.sellerId : trade.buyerId;
    };

    const formatTime = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatAddress = (address) => {
      if (!address) return 'Unknown';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const formatOrderId = (orderId) => {
      return orderId.substring(0, 16) + '...';
    };

    const getStatusLabel = (status) => {
      const labels = {
        'open': '待成交',
        'filled': '已成交',
        'cancelled': '已取消',
        'rejected': '已拒绝'
      };
      return labels[status] || status;
    };

    const fetchHoldings = async () => {
      if (!walletStore.token) return;
      
      try {
        const response = await fetch('/api/trades/holdings', {
          headers: {
            'Authorization': `Bearer ${walletStore.token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          holdings.value = data.holdings || [];
        }
      } catch (err) {
        console.error('Failed to fetch holdings:', err);
      }
    };

    const fetchTrades = async () => {
      if (!walletStore.token) return;
      
      try {
        const response = await fetch('/api/trades/trades', {
          headers: {
            'Authorization': `Bearer ${walletStore.token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          trades.value = data.trades || [];
        }
      } catch (err) {
        console.error('Failed to fetch trades:', err);
      }
    };

    const fetchOrders = async () => {
      if (!walletStore.token) return;
      
      try {
        const response = await fetch('/api/trades/orders', {
          headers: {
            'Authorization': `Bearer ${walletStore.token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          orders.value = data.orders || [];
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };

    const fetchAllData = async () => {
      isLoading.value = true;
      await Promise.all([fetchHoldings(), fetchTrades(), fetchOrders()]);
      isLoading.value = false;
    };

    const sellHolding = (holding) => {
      // TODO: 实现卖出持仓的逻辑
      alert(`卖出 ${holding.quantity} 份 ${holding.tokenType.toUpperCase()}`);
    };

    const transferHolding = (holding) => {
      // TODO: 实现转账持仓的逻辑
      alert(`转账 ${holding.quantity} 份 ${holding.tokenType.toUpperCase()}`);
    };

    const cancelOrder = async (orderId) => {
      if (!walletStore.token) return;
      
      try {
        const response = await fetch(`/api/trades/orders/${orderId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${walletStore.token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          alert('订单已取消');
          fetchOrders();
        }
      } catch (err) {
        console.error('Failed to cancel order:', err);
      }
    };

    onMounted(() => {
      fetchAllData();
      
      // 连接 WebSocket
      if (walletStore.address) {
        wsStore.connect(walletStore.address);
      }
      
      // 监听持仓更新
      const unsubscribeHolding = wsStore.onMessage('holding_update', (data) => {
        holdings.value = data.data || [];
      });
      
      // 监听订单更新
      const unsubscribeOrder = wsStore.onMessage('order_update', (data) => {
        fetchOrders();
      });
      
      // 监听交易更新
      const unsubscribeTrade = wsStore.onMessage('trade_executed', (data) => {
        fetchTrades();
      });
      
      // 清理函数
      return () => {
        unsubscribeHolding();
        unsubscribeOrder();
        unsubscribeTrade();
      };
    });

    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (walletStore.address) {
        wsStore.disconnect();
      }
    });

    return {
      activeTab,
      holdings,
      trades,
      orders,
      isLoading,
      getHoldingPrice,
      getReturnPercent,
      getReturnClass,
      getTradeType,
      getCounterparty,
      formatTime,
      formatAddress,
      formatOrderId,
      getStatusLabel,
      sellHolding,
      transferHolding,
      cancelOrder
    };
  }
};
</script>

<style scoped>
.portfolio-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(147, 112, 219, 0.2);
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(147, 112, 219, 0.1);
  padding-bottom: 12px;
}

.tab {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #a0aec0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
}

.tab:hover {
  background: rgba(147, 112, 219, 0.1);
  color: #e0e7ff;
}

.tab.active {
  background: linear-gradient(135deg, rgba(147, 112, 219, 0.3), rgba(168, 85, 247, 0.3));
  color: #e0e7ff;
  border-bottom: 2px solid #9370db;
}

.tab-icon {
  font-size: 16px;
}

.tab-content {
  min-height: 300px;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 持仓卡片 */
.holdings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.holding-card {
  background: rgba(147, 112, 219, 0.05);
  border: 1px solid rgba(147, 112, 219, 0.1);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
}

.holding-card:hover {
  background: rgba(147, 112, 219, 0.1);
  border-color: rgba(147, 112, 219, 0.2);
}

.holding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.market-id {
  font-size: 13px;
  font-weight: 600;
  color: #e0e7ff;
}

.token-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.token-type.yes {
  background: rgba(16, 185, 129, 0.2);
  color: #86efac;
}

.token-type.no {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.holding-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.holding-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.holding-stat .label {
  color: #a0aec0;
}

.holding-stat .value {
  color: #e0e7ff;
  font-weight: 600;
}

.holding-stat .value.positive {
  color: #86efac;
}

.holding-stat .value.negative {
  color: #fca5a5;
}

.holding-footer {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.sell {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-btn.sell:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fff;
}

.action-btn.transfer {
  background: rgba(147, 112, 219, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(147, 112, 219, 0.3);
}

.action-btn.transfer:hover {
  background: rgba(147, 112, 219, 0.3);
  color: #e0e7ff;
}

/* 表格 */
.table-wrapper {
  overflow-x: auto;
}

.trades-table,
.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.trades-table thead,
.orders-table thead {
  background: rgba(147, 112, 219, 0.05);
  border-bottom: 1px solid rgba(147, 112, 219, 0.1);
}

.trades-table th,
.orders-table th {
  padding: 10px 12px;
  text-align: left;
  color: #cbd5e1;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.trades-table td,
.orders-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(147, 112, 219, 0.05);
  color: #a0aec0;
}

.trade-row.buy:hover,
.order-row.open:hover {
  background: rgba(16, 185, 129, 0.05);
}

.trade-row.sell:hover {
  background: rgba(239, 68, 68, 0.05);
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.buy {
  background: rgba(16, 185, 129, 0.2);
  color: #86efac;
}

.badge.sell {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.open {
  background: rgba(147, 112, 219, 0.2);
  color: #cbd5e1;
}

.status-badge.filled {
  background: rgba(16, 185, 129, 0.2);
  color: #86efac;
}

.status-badge.cancelled {
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
}

.cancel-btn {
  padding: 4px 8px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  color: #fca5a5;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fff;
}

.no-action {
  color: #6b7280;
}

@media (max-width: 768px) {
  .holdings-grid {
    grid-template-columns: 1fr;
  }

  .trades-table,
  .orders-table {
    font-size: 11px;
  }

  .trades-table th,
  .orders-table th,
  .trades-table td,
  .orders-table td {
    padding: 8px 10px;
  }
}
</style>

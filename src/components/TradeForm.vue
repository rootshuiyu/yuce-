<template>
  <div class="trade-form-container">
    <!-- 选项卡 -->
    <div class="tabs">
      <button 
        :class="['tab', { active: activeTab === 'buy' }]"
        @click="activeTab = 'buy'"
      >
        <span class="tab-icon">📈</span>
        <span>买入 YES</span>
      </button>
      <button 
        :class="['tab', { active: activeTab === 'sell' }]"
        @click="activeTab = 'sell'"
      >
        <span class="tab-icon">📉</span>
        <span>卖出 NO</span>
      </button>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <!-- 市场信息 -->
      <div class="market-info">
        <div class="info-item">
          <span class="label">当前价格</span>
          <span class="value">{{ currentPrice.toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="label">对方价格</span>
          <span class="value">{{ (1 - currentPrice).toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="label">交易量</span>
          <span class="value">{{ marketStats.totalVolume || 0 }}</span>
        </div>
      </div>

      <!-- 表单字段 -->
      <div class="form-fields">
        <!-- 数量输入 -->
        <div class="form-group">
          <label>数量 (份)</label>
          <div class="input-group">
            <input 
              v-model.number="form.quantity" 
              type="number" 
              placeholder="输入购买数量"
              min="1"
              step="1"
              @input="calculateTotal"
            />
            <div class="quick-buttons">
              <button @click="form.quantity = 10" class="quick-btn">10</button>
              <button @click="form.quantity = 50" class="quick-btn">50</button>
              <button @click="form.quantity = 100" class="quick-btn">100</button>
            </div>
          </div>
        </div>

        <!-- 价格输入 -->
        <div class="form-group">
          <label>价格 (¢)</label>
          <div class="input-group">
            <input 
              v-model.number="form.price" 
              type="number" 
              placeholder="输入价格"
              min="0"
              max="100"
              step="1"
              @input="calculateTotal"
            />
            <div class="quick-buttons">
              <button @click="form.price = currentPrice * 100" class="quick-btn">市价</button>
              <button @click="form.price = (currentPrice * 100) - 1" class="quick-btn">-1¢</button>
              <button @click="form.price = (currentPrice * 100) + 1" class="quick-btn">+1¢</button>
            </div>
          </div>
        </div>

        <!-- 成本计算 -->
        <div class="cost-breakdown">
          <div class="cost-item">
            <span class="label">成本</span>
            <span class="value">{{ totalCost.toFixed(2) }} USDC</span>
          </div>
          <div class="cost-item">
            <span class="label">手续费 (0.5%)</span>
            <span class="value">{{ (totalCost * 0.005).toFixed(2) }} USDC</span>
          </div>
          <div class="cost-item total">
            <span class="label">总计</span>
            <span class="value">{{ (totalCost * 1.005).toFixed(2) }} USDC</span>
          </div>
        </div>

        <!-- 风险提示 -->
        <div class="risk-warning">
          <span class="warning-icon">⚠️</span>
          <span>
            如果价格为 0¢，您将损失全部投资。
            如果价格为 100¢，您将获得最大收益。
          </span>
        </div>

        <!-- 提交按钮 -->
        <button 
          :class="['submit-btn', activeTab]"
          @click="submitOrder"
          :disabled="!isFormValid || isSubmitting"
        >
          <span v-if="!isSubmitting">
            {{ activeTab === 'buy' ? '买入 YES' : '卖出 NO' }}
          </span>
          <span v-else>处理中...</span>
        </button>

        <!-- 错误信息 -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- 成功信息 -->
        <div v-if="success" class="success-message">
          ✓ 订单已提交！订单 ID: {{ successOrderId }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useWalletStore } from '../stores/wallet';
import { useMarketStore } from '../stores/market';

export default {
  name: 'TradeForm',
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
  emits: ['order-created'],
  setup(props, { emit }) {
    const walletStore = useWalletStore();
    const marketStore = useMarketStore();

    const activeTab = ref('buy');
    const form = ref({
      quantity: 10,
      price: 50
    });
    const error = ref('');
    const success = ref(false);
    const successOrderId = ref('');
    const isSubmitting = ref(false);
    const marketStats = ref({
      totalVolume: 0,
      avgPrice: 0,
      uniqueTraders: 0
    });

    const totalCost = computed(() => {
      return (form.value.quantity * form.value.price) / 100;
    });

    const isFormValid = computed(() => {
      return form.value.quantity > 0 && form.value.price > 0 && form.value.price <= 100 && walletStore.isConnected;
    });

    const calculateTotal = () => {
      // 自动计算总成本
    };

    const submitOrder = async () => {
      if (!isFormValid.value) {
        error.value = '请填写完整的表单信息';
        return;
      }

      if (!walletStore.isConnected) {
        error.value = '请先连接钱包';
        return;
      }

      isSubmitting.value = true;
      error.value = '';
      success.value = false;

      try {
        const response = await fetch('/api/trades/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${walletStore.token}`
          },
          body: JSON.stringify({
            marketId: props.marketId,
            side: activeTab.value,
            quantity: form.value.quantity,
            price: form.value.price / 100 // 转换为 0-1 的价格
          })
        });

        const data = await response.json();

        if (data.success) {
          success.value = true;
          successOrderId.value = data.orderId;
          form.value = { quantity: 10, price: 50 };
          
          // 3 秒后清除成功信息
          setTimeout(() => {
            success.value = false;
          }, 3000);

          emit('order-created', data);
        } else {
          error.value = data.message || '订单创建失败';
        }
      } catch (err) {
        error.value = '网络错误: ' + err.message;
      } finally {
        isSubmitting.value = false;
      }
    };

    // 获取市场统计
    const fetchMarketStats = async () => {
      try {
        const response = await fetch(`/api/trades/market/${props.marketId}/stats`);
        const data = await response.json();
        if (data.success) {
          marketStats.value = data.stats;
        }
      } catch (err) {
        console.error('Failed to fetch market stats:', err);
      }
    };

    // 初始化
    fetchMarketStats();
    const statsInterval = setInterval(fetchMarketStats, 5000); // 每 5 秒刷新一次

    return {
      activeTab,
      form,
      error,
      success,
      successOrderId,
      isSubmitting,
      totalCost,
      isFormValid,
      marketStats,
      calculateTotal,
      submitOrder
    };
  }
};
</script>

<style scoped>
.trade-form-container {
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

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.market-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
  background: rgba(147, 112, 219, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(147, 112, 219, 0.1);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 12px;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #e0e7ff;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group input {
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(147, 112, 219, 0.2);
  border-radius: 8px;
  color: #e0e7ff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: #9370db;
  box-shadow: 0 0 0 3px rgba(147, 112, 219, 0.1);
}

.quick-buttons {
  display: flex;
  gap: 8px;
}

.quick-btn {
  flex: 1;
  padding: 8px 12px;
  background: rgba(147, 112, 219, 0.1);
  border: 1px solid rgba(147, 112, 219, 0.2);
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-btn:hover {
  background: rgba(147, 112, 219, 0.2);
  color: #e0e7ff;
  border-color: #9370db;
}

.cost-breakdown {
  padding: 16px;
  background: rgba(147, 112, 219, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(147, 112, 219, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.cost-item .label {
  color: #a0aec0;
}

.cost-item .value {
  color: #cbd5e1;
  font-weight: 500;
}

.cost-item.total {
  padding-top: 12px;
  border-top: 1px solid rgba(147, 112, 219, 0.1);
  font-weight: 600;
}

.cost-item.total .label {
  color: #e0e7ff;
}

.cost-item.total .value {
  color: #9370db;
  font-size: 14px;
}

.risk-warning {
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.submit-btn {
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.submit-btn.buy {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.submit-btn.buy:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
}

.submit-btn.sell {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.submit-btn.sell:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  padding: 12px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 13px;
  animation: slideIn 0.3s ease;
}

.success-message {
  padding: 12px 14px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #86efac;
  font-size: 13px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .market-info {
    grid-template-columns: 1fr;
  }

  .quick-buttons {
    flex-wrap: wrap;
  }
}
</style>

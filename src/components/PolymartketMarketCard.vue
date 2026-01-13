<template>
  <div class="market-card" @click="emit('click')">
    <!-- 分类标签 -->
    <div class="card-header">
      <span class="category-badge">{{ market.subcategory }}</span>
      <span class="end-date">{{ formatDate(market.endDate) }}</span>
    </div>

    <!-- 市场问题 -->
    <h3 class="market-question">{{ market.question }}</h3>

    <!-- 概率显示区域 -->
    <div class="probability-section">
      <!-- YES 概率 -->
      <div class="probability-item yes">
        <div class="prob-header">
          <span class="prob-label">YES</span>
          <span class="prob-percentage">{{ yesProb }}%</span>
        </div>
        <div class="prob-bar">
          <div class="prob-fill yes-fill" :style="{ width: yesProb + '%' }"></div>
        </div>
      </div>

      <!-- NO 概率 -->
      <div class="probability-item no">
        <div class="prob-header">
          <span class="prob-label">NO</span>
          <span class="prob-percentage">{{ noProb }}%</span>
        </div>
        <div class="prob-bar">
          <div class="prob-fill no-fill" :style="{ width: noProb + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 交易信息 -->
    <div class="trading-info">
      <div class="info-item">
        <span class="info-label">Volume</span>
        <span class="info-value">${{ formatVolume(market.totalVolume) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Traders</span>
        <span class="info-value">{{ market.traders || 0 }}</span>
      </div>
    </div>

    <!-- 交易按钮 -->
    <div class="card-actions">
      <button class="btn-trade yes" @click.stop="emit('trade', 'yes')">
        BUY YES
      </button>
      <button class="btn-trade no" @click.stop="emit('trade', 'no')">
        BUY NO
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  market: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'trade'])

const yesProb = computed(() => {
  return Math.round((props.market.impliedProbability?.yes || props.market.currentYesProb || 0.5) * 100)
})

const noProb = computed(() => {
  return Math.round((props.market.impliedProbability?.no || props.market.currentNoProb || 0.5) * 100)
})

const formatVolume = (volume) => {
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(1) + 'M'
  }
  if (volume >= 1000) {
    return (volume / 1000).toFixed(1) + 'K'
  }
  return volume.toFixed(0)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}/${day}`
}
</script>

<style scoped>
.market-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 320px;
}

.market-card:hover {
  border-color: #9d4edd;
  box-shadow: 0 8px 24px rgba(157, 78, 221, 0.15);
  transform: translateY(-4px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.category-badge {
  background: rgba(157, 78, 221, 0.2);
  color: #9d4edd;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.end-date {
  font-size: 0.8rem;
  color: #999;
  white-space: nowrap;
}

/* 市场问题 */
.market-question {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  margin-bottom: 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8em;
}

/* 概率显示区域 */
.probability-section {
  margin-bottom: 1.25rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.probability-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prob-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prob-label {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.probability-item.yes .prob-label {
  color: #06d6a0;
}

.probability-item.no .prob-label {
  color: #ff6b6b;
}

.prob-percentage {
  font-size: 1.25rem;
  font-weight: 700;
}

.probability-item.yes .prob-percentage {
  color: #06d6a0;
}

.probability-item.no .prob-percentage {
  color: #ff6b6b;
}

.prob-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.prob-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.yes-fill {
  background: linear-gradient(90deg, #06d6a0 0%, #00c896 100%);
}

.no-fill {
  background: linear-gradient(90deg, #ff6b6b 0%, #ff5252 100%);
}

/* 交易信息 */
.trading-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}

/* 交易按钮 */
.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.btn-trade {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-trade.yes {
  background: linear-gradient(135deg, #06d6a0 0%, #00c896 100%);
  color: #000;
}

.btn-trade.yes:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 214, 160, 0.3);
}

.btn-trade.no {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  color: #fff;
}

.btn-trade.no:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.btn-trade:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .market-card {
    padding: 1rem;
    min-height: 300px;
  }

  .market-question {
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }

  .probability-section {
    margin-bottom: 1rem;
  }

  .trading-info {
    margin-bottom: 1rem;
    padding: 0.5rem;
  }

  .btn-trade {
    padding: 0.65rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>

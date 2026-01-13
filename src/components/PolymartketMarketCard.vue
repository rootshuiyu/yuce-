<template>
  <div class="polymarket-card" @click="emit('click')">
    <!-- 市场图片 -->
    <div class="card-image">
      <img :src="market.imageUrl || defaultImage" :alt="market.question" />
      <div class="card-overlay"></div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 标题 -->
      <h3 class="market-title">{{ market.question }}</h3>

      <!-- 主要概率显示 -->
      <div class="main-probability">
        <div class="probability-box yes">
          <span class="prob-label">YES</span>
          <span class="prob-value">{{ yesProb }}%</span>
        </div>
        <div class="probability-box no">
          <span class="prob-label">NO</span>
          <span class="prob-value">{{ noProb }}%</span>
        </div>
      </div>

      <!-- 交易量 -->
      <div class="volume-info">
        <span class="volume-label">Volume</span>
        <span class="volume-value">${{ formatVolume(market.totalVolume) }}</span>
      </div>

      <!-- 底部信息 -->
      <div class="card-footer">
        <div class="footer-left">
          <span class="category-badge">{{ market.subcategory }}</span>
        </div>
        <div class="footer-right">
          <span class="end-date">{{ formatDate(market.endDate) }}</span>
        </div>
      </div>

      <!-- 交易按钮 -->
      <div class="card-actions">
        <button class="btn-trade yes" @click.stop="emit('trade', 'yes')">
          Buy YES
        </button>
        <button class="btn-trade no" @click.stop="emit('trade', 'no')">
          Buy NO
        </button>
      </div>
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

const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250"%3E%3Crect fill="%23374151" width="400" height="250"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="%239CA3AF" text-anchor="middle" dominant-baseline="middle"%3EMarket%3C/text%3E%3C/svg%3E'

const yesProb = computed(() => {
  return Math.round((props.market.impliedProbability?.yes || 0.5) * 100)
})

const noProb = computed(() => {
  return Math.round((props.market.impliedProbability?.no || 0.5) * 100)
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
  if (!date) return 'TBD'
  const d = new Date(date)
  const now = new Date()
  const diff = d - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  
  if (days < 0) return 'Expired'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `${days}d`
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.polymarket-card {
  background: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 420px;
}

.polymarket-card:hover {
  border-color: var(--color-purple-primary);
  box-shadow: 0 12px 24px rgba(168, 85, 247, 0.2);
  transform: translateY(-6px);
}

/* 市场图片 */
.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.polymarket-card:hover .card-image img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
}

/* 卡片内容 */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
}

/* 标题 */
.market-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e5e7eb;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 主要概率显示 */
.main-probability {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.probability-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.875rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.probability-box.yes {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.probability-box.no {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.probability-box:hover {
  border-color: currentColor;
  background: rgba(255, 255, 255, 0.05);
}

.prob-label {
  font-size: 0.75rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.prob-value {
  font-size: 1.5rem;
  margin-top: 0.25rem;
}

/* 交易量 */
.volume-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(168, 85, 247, 0.05);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.volume-label {
  color: #9ca3af;
}

.volume-value {
  color: var(--color-purple-light);
  font-weight: 600;
}

/* 底部信息 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.category-badge {
  background: var(--color-dark-bg);
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  color: var(--color-purple-light);
}

.end-date {
  background: rgba(168, 85, 247, 0.1);
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
}

/* 交易按钮 */
.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-trade {
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-trade.yes {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.btn-trade.yes:hover {
  background: rgba(34, 197, 94, 0.3);
  border-color: #86efac;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.btn-trade.no {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.btn-trade.no:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: #fca5a5;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .polymarket-card {
    min-height: 380px;
  }

  .card-image {
    height: 150px;
  }

  .card-content {
    padding: 1rem;
    gap: 0.875rem;
  }

  .market-title {
    font-size: 1rem;
  }

  .prob-value {
    font-size: 1.25rem;
  }
}
</style>

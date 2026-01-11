<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">交易市场</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <!-- 市场信息 -->
        <div class="market-info">
          <div class="question">{{ market.question }}</div>
          <div class="subcategory">{{ market.subcategory }}</div>
        </div>

        <!-- 交易选项 -->
        <div class="trade-options">
          <div class="option-group">
            <label class="option-label">选择交易方向</label>
            <div class="options">
              <button
                class="option-btn yes"
                :class="{ active: selectedSide === 'yes' }"
                @click="selectedSide = 'yes'"
              >
                <span class="option-icon">✓</span>
                <span class="option-text">YES</span>
                <span class="option-prob">{{ (market.impliedProbability?.yes * 100 || 50).toFixed(1) }}%</span>
              </button>
              <button
                class="option-btn no"
                :class="{ active: selectedSide === 'no' }"
                @click="selectedSide = 'no'"
              >
                <span class="option-icon">✗</span>
                <span class="option-text">NO</span>
                <span class="option-prob">{{ (market.impliedProbability?.no * 100 || 50).toFixed(1) }}%</span>
              </button>
            </div>
          </div>

          <!-- 交易金额 -->
          <div class="input-group">
            <label class="input-label">交易金额 (USDC)</label>
            <div class="input-wrapper">
              <span class="input-prefix">$</span>
              <input
                v-model.number="tradeAmount"
                type="number"
                placeholder="输入金额"
                min="1"
                max="10000"
                class="trade-input"
              />
            </div>
            <div class="input-hint">
              <span>余额: ${{ walletBalance }}</span>
              <button class="hint-link" @click="tradeAmount = walletBalance">全部</button>
            </div>
          </div>

          <!-- 预计收益 -->
          <div class="estimate-section">
            <div class="estimate-row">
              <span class="estimate-label">投入金额</span>
              <span class="estimate-value">${{ tradeAmount || 0 }}</span>
            </div>
            <div class="estimate-row">
              <span class="estimate-label">预计收益</span>
              <span class="estimate-value estimate-profit">
                ${{ estimatedReturn.toFixed(2) }}
              </span>
            </div>
            <div class="estimate-row">
              <span class="estimate-label">预计利润</span>
              <span class="estimate-value" :class="{ positive: estimatedProfit > 0, negative: estimatedProfit < 0 }">
                {{ estimatedProfit > 0 ? '+' : '' }}${{ estimatedProfit.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 风险提示 -->
        <div class="risk-warning">
          <span class="warning-icon">⚠️</span>
          <span class="warning-text">预测市场存在风险，您可能会损失全部投入资金</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="close">取消</button>
        <button
          class="btn-trade"
          :class="{ [selectedSide]: true }"
          :disabled="!canTrade"
          @click="executeTrade"
        >
          {{ selectedSide === 'yes' ? '买入 YES' : '买入 NO' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  market: {
    type: Object,
    required: true
  },
  side: {
    type: String,
    default: 'yes'
  }
})

const emit = defineEmits(['close', 'trade'])

const selectedSide = ref(props.side)
const tradeAmount = ref(100)
const walletBalance = ref(1000)

const estimatedReturn = computed(() => {
  if (!tradeAmount.value) return 0
  const probability = selectedSide.value === 'yes'
    ? props.market.impliedProbability?.yes || 0.5
    : props.market.impliedProbability?.no || 0.5
  return tradeAmount.value / probability
})

const estimatedProfit = computed(() => {
  return estimatedReturn.value - tradeAmount.value
})

const canTrade = computed(() => {
  return tradeAmount.value > 0 && tradeAmount.value <= walletBalance.value
})

const close = () => {
  emit('close')
}

const executeTrade = () => {
  if (!canTrade.value) return

  emit('trade', {
    marketId: props.market.id,
    side: selectedSide.value,
    amount: tradeAmount.value,
    timestamp: new Date().toISOString()
  })

  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.5rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-dark-border);
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-purple-light);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--color-purple-light);
}

.modal-body {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
}

/* 市场信息 */
.market-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.question {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-purple-light);
  line-height: 1.4;
}

.subcategory {
  font-size: 0.875rem;
  color: #9ca3af;
}

/* 交易选项 */
.trade-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e5e7eb;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid var(--color-dark-border);
  border-radius: 0.375rem;
  background-color: var(--color-dark-bg);
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.option-btn:hover {
  border-color: currentColor;
}

.option-btn.active {
  background-color: currentColor;
  color: var(--color-dark-bg);
  border-color: currentColor;
}

.option-btn.yes {
  color: var(--color-yes);
}

.option-btn.no {
  color: var(--color-no);
}

.option-icon {
  font-size: 1.5rem;
}

.option-text {
  font-size: 0.875rem;
}

.option-prob {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* 输入组 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e5e7eb;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--color-dark-bg);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: var(--color-purple-primary);
}

.input-prefix {
  font-size: 1rem;
  color: #9ca3af;
  margin-right: 0.5rem;
}

.trade-input {
  flex: 1;
  background: none;
  border: none;
  color: #e5e7eb;
  font-size: 1rem;
  outline: none;
}

.trade-input::placeholder {
  color: #6b7280;
}

.input-hint {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9ca3af;
}

.hint-link {
  background: none;
  border: none;
  color: var(--color-purple-light);
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0;
}

.hint-link:hover {
  color: var(--color-purple-primary);
}

/* 预计收益 */
.estimate-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--color-dark-bg);
  border-radius: 0.375rem;
  border: 1px solid var(--color-dark-border);
}

.estimate-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.estimate-label {
  font-size: 0.875rem;
  color: #9ca3af;
}

.estimate-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e5e7eb;
}

.estimate-value.estimate-profit {
  color: var(--color-yes);
}

.estimate-value.positive {
  color: var(--color-yes);
}

.estimate-value.negative {
  color: var(--color-no);
}

/* 风险提示 */
.risk-warning {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.375rem;
}

.warning-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.warning-text {
  font-size: 0.8125rem;
  color: #fca5a5;
}

/* 模态框底部 */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-dark-border);
  flex-shrink: 0;
}

.btn-cancel,
.btn-trade {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background-color: var(--color-dark-bg);
  color: #e5e7eb;
  border: 1px solid var(--color-dark-border);
}

.btn-cancel:hover {
  border-color: var(--color-purple-primary);
  color: var(--color-purple-light);
}

.btn-trade {
  color: var(--color-dark-bg);
}

.btn-trade.yes {
  background-color: var(--color-yes);
}

.btn-trade.yes:hover:not(:disabled) {
  background-color: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-trade.no {
  background-color: var(--color-no);
}

.btn-trade.no:hover:not(:disabled) {
  background-color: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-trade:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .modal-content {
    max-width: 100%;
    border-radius: 0.5rem 0.5rem 0 0;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }

  .modal-body {
    padding: 1rem;
    gap: 1rem;
  }

  .question {
    font-size: 0.95rem;
  }

  .modal-footer {
    padding: 1rem;
    gap: 0.5rem;
  }

  .btn-cancel,
  .btn-trade {
    padding: 0.625rem;
    font-size: 0.8125rem;
  }
}
</style>

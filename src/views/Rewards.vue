<template>
  <div class="rewards-page">
    <div class="page-header">
      <h1>我的奖励</h1>
      <p class="subtitle">查看和领取您的市场奖励</p>
    </div>

    <!-- 奖励统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">🎁</div>
        <div class="stat-content">
          <div class="stat-label">待领取奖励</div>
          <div class="stat-value">${{ totalPendingAmount.toFixed(2) }}</div>
          <div class="stat-sub">{{ pendingRewards.length }} 个奖励</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-label">已领取奖励</div>
          <div class="stat-value">${{ totalClaimedAmount.toFixed(2) }}</div>
          <div class="stat-sub">{{ claimedRewards.length }} 个奖励</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-label">总奖励</div>
          <div class="stat-value">${{ (totalPendingAmount + totalClaimedAmount).toFixed(2) }}</div>
          <div class="stat-sub">{{ (pendingRewards.length + claimedRewards.length) }} 个奖励</div>
        </div>
      </div>
    </div>

    <!-- 待领取奖励 -->
    <div class="rewards-section">
      <div class="section-header">
        <h2 class="section-title">待领取奖励 ({{ pendingRewards.length }})</h2>
        <button 
          v-if="pendingRewards.length > 0" 
          class="btn-claim-all"
          @click="claimAllRewards"
          :disabled="claiming"
        >
          {{ claiming ? '领取中...' : '一键领取全部' }}
        </button>
      </div>

      <div v-if="pendingRewards.length > 0" class="rewards-list">
        <div v-for="reward in pendingRewards" :key="reward.id" class="reward-item pending">
          <div class="reward-header">
            <div class="reward-info">
              <h3 class="reward-market">市场 #{{ reward.marketId.substring(0, 8) }}</h3>
              <p class="reward-trade">交易 #{{ reward.tradeId.substring(0, 8) }}</p>
            </div>
            <div class="reward-amount">
              <div class="amount-value">${{ reward.amount.toFixed(2) }}</div>
              <span class="amount-label">奖励金额</span>
            </div>
          </div>
          <div class="reward-meta">
            <span class="meta-item">
              <span class="meta-label">创建时间:</span>
              <span class="meta-value">{{ formatDate(reward.createdAt) }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">状态:</span>
              <span class="meta-value status-pending">待领取</span>
            </span>
          </div>
          <div class="reward-actions">
            <button 
              class="btn-claim"
              @click="claimReward(reward.id)"
              :disabled="claiming"
            >
              {{ claiming ? '领取中...' : '领取奖励' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">暂无待领取奖励</div>
      </div>
    </div>

    <!-- 已领取奖励 -->
    <div class="rewards-section">
      <h2 class="section-title">已领取奖励 ({{ claimedRewards.length }})</h2>

      <div v-if="claimedRewards.length > 0" class="rewards-list">
        <div v-for="reward in claimedRewards" :key="reward.id" class="reward-item claimed">
          <div class="reward-header">
            <div class="reward-info">
              <h3 class="reward-market">市场 #{{ reward.marketId.substring(0, 8) }}</h3>
              <p class="reward-trade">交易 #{{ reward.tradeId.substring(0, 8) }}</p>
            </div>
            <div class="reward-amount">
              <div class="amount-value">${{ reward.amount.toFixed(2) }}</div>
              <span class="amount-label">奖励金额</span>
            </div>
          </div>
          <div class="reward-meta">
            <span class="meta-item">
              <span class="meta-label">领取时间:</span>
              <span class="meta-value">{{ formatDate(reward.claimedAt) }}</span>
            </span>
            <span class="meta-item">
              <span class="meta-label">状态:</span>
              <span class="meta-value status-claimed">已领取</span>
            </span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-text">暂无已领取奖励</div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="toast-success">
      <span class="toast-icon">✓</span>
      <span class="toast-text">{{ successMessage }}</span>
      <button class="toast-close" @click="successMessage = ''">×</button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="toast-error">
      <span class="toast-icon">✕</span>
      <span class="toast-text">{{ errorMessage }}</span>
      <button class="toast-close" @click="errorMessage = ''">×</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'Rewards',
  setup() {
    const rewards = ref([])
    const claiming = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')

    const pendingRewards = computed(() => 
      rewards.value.filter(r => r.status === 'pending')
    )

    const claimedRewards = computed(() => 
      rewards.value.filter(r => r.status === 'claimed')
    )

    const totalPendingAmount = computed(() =>
      pendingRewards.value.reduce((sum, r) => sum + r.amount, 0)
    )

    const totalClaimedAmount = computed(() =>
      claimedRewards.value.reduce((sum, r) => sum + r.amount, 0)
    )

    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          errorMessage.value = '请先登录'
          return
        }

        const response = await fetch('/api/settlement/rewards', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()
        if (data.success) {
          rewards.value = data.data.rewards || []
        } else {
          errorMessage.value = data.message || '获取奖励失败'
        }
      } catch (error) {
        console.error('获取奖励失败:', error)
        errorMessage.value = '获取奖励失败，请重试'
      }
    }

    const claimReward = async (rewardId) => {
      try {
        claiming.value = true
        const token = localStorage.getItem('token')
        if (!token) {
          errorMessage.value = '请先登录'
          return
        }

        const response = await fetch(`/api/settlement/claim/${rewardId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()
        if (data.success) {
          successMessage.value = `成功领取 $${data.data.amount.toFixed(2)} 奖励`
          await fetchRewards()
          setTimeout(() => successMessage.value = '', 3000)
        } else {
          errorMessage.value = data.message || '领取失败'
        }
      } catch (error) {
        console.error('领取奖励失败:', error)
        errorMessage.value = '领取失败，请重试'
      } finally {
        claiming.value = false
      }
    }

    const claimAllRewards = async () => {
      try {
        claiming.value = true
        const token = localStorage.getItem('token')
        if (!token) {
          errorMessage.value = '请先登录'
          return
        }

        const rewardIds = pendingRewards.value.map(r => r.id)
        const response = await fetch('/api/settlement/claim-batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rewardIds })
        })

        const data = await response.json()
        if (data.success) {
          successMessage.value = `成功领取 $${data.data.totalAmount.toFixed(2)} 奖励`
          await fetchRewards()
          setTimeout(() => successMessage.value = '', 3000)
        } else {
          errorMessage.value = data.message || '领取失败'
        }
      } catch (error) {
        console.error('批量领取失败:', error)
        errorMessage.value = '领取失败，请重试'
      } finally {
        claiming.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(() => {
      fetchRewards()
    })

    return {
      rewards,
      claiming,
      successMessage,
      errorMessage,
      pendingRewards,
      claimedRewards,
      totalPendingAmount,
      totalClaimedAmount,
      claimReward,
      claimAllRewards,
      formatDate
    }
  }
}
</script>

<style scoped>
.rewards-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #999;
  font-size: 0.95rem;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #9d4edd;
  box-shadow: 0 0 20px rgba(157, 78, 221, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #9d4edd;
}

.stat-sub {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

/* 奖励部分 */
.rewards-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
}

.btn-claim-all {
  background: linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-claim-all:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(157, 78, 221, 0.3);
}

.btn-claim-all:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 奖励列表 */
.rewards-list {
  display: grid;
  gap: 1rem;
}

.reward-item {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.reward-item.pending {
  border-left: 4px solid #9d4edd;
}

.reward-item.pending:hover {
  border-color: #9d4edd;
  box-shadow: 0 0 20px rgba(157, 78, 221, 0.2);
}

.reward-item.claimed {
  border-left: 4px solid #06d6a0;
  opacity: 0.8;
}

.reward-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reward-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.25rem;
}

.reward-trade {
  font-size: 0.85rem;
  color: #666;
}

.reward-amount {
  text-align: right;
}

.amount-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #9d4edd;
}

.amount-label {
  font-size: 0.8rem;
  color: #666;
  display: block;
  margin-top: 0.25rem;
}

.reward-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.meta-label {
  color: #666;
}

.meta-value {
  color: #fff;
}

.status-pending {
  color: #ffa500;
}

.status-claimed {
  color: #06d6a0;
}

.reward-actions {
  display: flex;
  gap: 1rem;
}

.btn-claim {
  flex: 1;
  background: linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-claim:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(157, 78, 221, 0.3);
}

.btn-claim:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1rem;
}

/* 提示信息 */
.toast-success,
.toast-error {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: #06d6a0;
  color: white;
}

.toast-error {
  background: #ff6b6b;
  color: white;
}

.toast-icon {
  font-weight: 700;
  font-size: 1.2rem;
}

.toast-text {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rewards-page {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .btn-claim-all {
    width: 100%;
  }

  .reward-header {
    flex-direction: column;
    gap: 1rem;
  }

  .reward-amount {
    text-align: left;
  }

  .reward-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .toast-success,
  .toast-error {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>

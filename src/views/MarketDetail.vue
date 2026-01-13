<template>
  <div class="market-detail-page">
    <div class="market-detail-container">
      <!-- Back Button -->
      <div class="breadcrumb">
        <button @click="$router.back()" class="back-btn">← 返回</button>
      </div>

      <!-- Loading State -->
      <div v-if="marketStore.loading" class="card-dark p-8 text-center">
        <p class="text-gray-400">加载中...</p>
      </div>

      <!-- Market Not Found -->
      <div v-else-if="!marketStore.currentMarket" class="card-dark p-8 text-center">
        <p class="text-gray-400">市场不存在</p>
      </div>

      <!-- Market Content -->
      <div v-else>
        <!-- Market Header -->
        <div class="card-dark mb-8 p-8">
          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-3xl font-bold text-[#c4b5fd] mb-2">
                {{ marketStore.currentMarket.question }}
              </h1>
              <p class="text-gray-400">
                市场 ID: {{ marketStore.currentMarket.marketId }} • 状态: {{ marketStore.currentMarket.status }}
              </p>
            </div>
            <span :class="[
              'px-4 py-2 rounded font-medium',
              getStatusColor(marketStore.currentMarket.status)
            ]">
              {{ getStatusLabel(marketStore.currentMarket.status) }}
            </span>
          </div>
        </div>

        <!-- Probability Display -->
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="card-dark p-8">
            <h3 class="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              ✓ YES
            </h3>
            <div class="text-4xl font-bold text-green-400 mb-4">
              {{ (yesProb * 100).toFixed(1) }}%
            </div>
            <div class="w-full bg-[#1a1428] rounded-full h-3">
              <div
                class="bg-green-500 h-3 rounded-full transition-all"
                :style="{ width: `${yesProb * 100}%` }"
              />
            </div>
          </div>

          <div class="card-dark p-8">
            <h3 class="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              ✗ NO
            </h3>
            <div class="text-4xl font-bold text-red-400 mb-4">
              {{ (noProb * 100).toFixed(1) }}%
            </div>
            <div class="w-full bg-[#1a1428] rounded-full h-3">
              <div
                class="bg-red-500 h-3 rounded-full transition-all"
                :style="{ width: `${noProb * 100}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Market Stats -->
        <div class="card-dark mb-8 p-8">
          <h2 class="text-xl font-bold text-[#c4b5fd] mb-6">市场统计</h2>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-400 mb-2">交易量</p>
              <p class="text-2xl font-bold text-[#a78bfa]">${{ marketStore.currentMarket.totalVolume.toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400 mb-2">交易次数</p>
              <p class="text-2xl font-bold text-[#a78bfa]">{{ marketStore.currentMarket.transactionCount }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-400 mb-2">关闭时间</p>
              <p class="text-sm font-mono text-[#a78bfa]">
                {{ formatDate(marketStore.currentMarket.closeTime) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Trading Section -->
        <div class="card-dark p-8">
          <h2 class="text-xl font-bold text-[#c4b5fd] mb-4">交易</h2>
          <p class="text-gray-400 mb-6">选择你的预测</p>
          
          <div v-if="!walletStore.isConnected" class="p-4 bg-[#2a1f3d] border border-[#3d2f52] rounded mb-6">
            <p class="text-gray-400 mb-4">请先连接钱包以进行交易</p>
            <button @click="connectWallet" class="btn-primary">
              连接 MetaMask 钱包
            </button>
          </div>

          <div v-else class="grid grid-cols-2 gap-4">
            <button @click="openTradeModal('yes')" class="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-all">
              买入 YES
            </button>
            <button @click="openTradeModal('no')" class="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-all">
              买入 NO
            </button>
          </div>
        </div>

        <!-- Trade Modal -->
        <TradeModal
          :isOpen="showTradeModal"
          :market="marketStore.currentMarket"
          :option="selectedOption"
          @close="showTradeModal = false"
          @success="onTradeSuccess"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMarketStore } from '../stores/market'
import { useWalletStore } from '../stores/wallet'
import TradeModal from '../components/TradeModal.vue'
import TradeForm from '../components/TradeForm.vue'
import OrderBook from '../components/OrderBook.vue'
import PortfolioAndHistory from '../components/PortfolioAndHistory.vue'

const route = useRoute()
const marketStore = useMarketStore()
const walletStore = useWalletStore()

const yesProb = computed(() => marketStore.currentMarket?.impliedProbability?.yes || 0.5)
const noProb = computed(() => marketStore.currentMarket?.impliedProbability?.no || 0.5)

const getStatusColor = (status) => {
  const colors = {
    'trading': 'bg-blue-900 text-blue-300',
    'closed': 'bg-gray-700 text-gray-300',
    'finalized': 'bg-green-900 text-green-300',
    'invalid': 'bg-red-900 text-red-300'
  }
  return colors[status] || 'bg-gray-700 text-gray-300'
}

const getStatusLabel = (status) => {
  const labels = {
    'trading': '交易中',
    'closed': '已关闭',
    'proposed': '已提议',
    'challenged': '已挑战',
    'finalized': '已完成',
    'invalid': '无效'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const showTradeModal = ref(false)
const selectedOption = ref('yes')

const connectWallet = async () => {
  await walletStore.connectWallet()
}

const openTradeModal = (option) => {
  selectedOption.value = option
  showTradeModal.value = true
}

const onTradeSuccess = () => {
  // 交易成功后刷新市场数据
  marketStore.fetchMarketById(route.params.id)
}

onMounted(() => {
  marketStore.fetchMarketById(route.params.id)
})
</script>

<style scoped>
</style>

<template>
  <div class="pt-20 pb-12 min-h-screen bg-[#0f0a1a]">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-[#c4b5fd] mb-2">
          预测市场
        </h1>
        <p class="text-lg text-gray-400">
          参与全球事件预测，聚合集体智慧
        </p>
      </div>

      <!-- Search and Filter -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="md:col-span-2 relative">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="搜索市场..."
            class="w-full px-4 py-2 bg-[#2a1f3d] border border-[#3d2f52] rounded text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#a78bfa]"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="filterStatus = 'all'"
            :class="[
              'flex-1 py-2 px-4 rounded transition-all',
              filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'
            ]"
          >
            全部
          </button>
          <button
            @click="filterStatus = 'trading'"
            :class="[
              'flex-1 py-2 px-4 rounded transition-all',
              filterStatus === 'trading' ? 'btn-primary' : 'btn-secondary'
            ]"
          >
            交易中
          </button>
        </div>
      </div>

      <!-- Generate Test Data Button -->
      <div class="mb-8">
        <button
          @click="generateTestData"
          :disabled="marketStore.loading"
          class="btn-primary"
        >
          {{ marketStore.loading ? '生成中...' : '生成测试数据' }}
        </button>
      </div>

      <!-- Markets Grid -->
      <div v-if="marketStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="card-dark h-64 animate-pulse"></div>
      </div>
      <div v-else-if="filteredMarkets.length === 0" class="card-dark p-8 text-center">
        <p class="text-gray-400">未找到匹配的市场</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="market in filteredMarkets"
          :key="market.marketId"
          :to="`/market/${market.marketId}`"
          class="block group"
        >
          <div class="card-dark hover:border-[#a78bfa] transition-all cursor-pointer h-full p-6">
            <div class="flex items-start justify-between gap-2 mb-4">
              <h3 class="text-base font-semibold text-gray-200 line-clamp-2 group-hover:text-[#a78bfa] transition-colors">
                {{ market.question }}
              </h3>
              <span :class="[
                'px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
                getStatusColor(market.status)
              ]">
                {{ getStatusLabel(market.status) }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mb-4">
              {{ formatDate(market.closeTime) }}
            </p>

            <!-- Probability Display -->
            <div class="space-y-3 mb-4">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-1 text-sm font-medium text-green-400">
                    ✓ YES
                  </div>
                  <span class="text-sm font-bold text-green-400">
                    {{ (market.impliedProbability?.yes * 100 || 50).toFixed(0) }}%
                  </span>
                </div>
                <div class="w-full bg-[#1a1428] rounded-full h-2">
                  <div
                    class="bg-green-500 h-2 rounded-full transition-all"
                    :style="{ width: `${(market.impliedProbability?.yes || 0.5) * 100}%` }"
                  />
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <div class="flex items-center gap-1 text-sm font-medium text-red-400">
                    ✗ NO
                  </div>
                  <span class="text-sm font-bold text-red-400">
                    {{ (market.impliedProbability?.no * 100 || 50).toFixed(0) }}%
                  </span>
                </div>
                <div class="w-full bg-[#1a1428] rounded-full h-2">
                  <div
                    class="bg-red-500 h-2 rounded-full transition-all"
                    :style="{ width: `${(market.impliedProbability?.no || 0.5) * 100}%` }"
                  />
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>交易量: ${{ market.totalVolume.toLocaleString() }}</span>
              <span>{{ market.transactionCount }} 笔</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMarketStore } from '../stores/market'

const marketStore = useMarketStore()
const searchTerm = ref('')
const filterStatus = ref('all')

const filteredMarkets = computed(() => {
  return marketStore.markets.filter((market) => {
    const matchesSearch = market.question
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase())
    const matchesStatus =
      filterStatus.value === 'all' || market.status === filterStatus.value
    return matchesSearch && matchesStatus
  })
})

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

const generateTestData = async () => {
  await marketStore.generateTestData(10)
}

onMounted(() => {
  marketStore.fetchMarkets()
})
</script>

<style scoped>
</style>

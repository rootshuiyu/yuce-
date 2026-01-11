<template>
  <div class="pt-20 pb-12 min-h-screen bg-[#0f0a1a]">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <h1 class="text-4xl font-bold text-[#c4b5fd] mb-8">用户中心</h1>

      <!-- Not Connected State -->
      <div v-if="!walletStore.isConnected" class="card-dark p-8 text-center">
        <p class="text-gray-400 mb-6">请先连接钱包查看您的信息</p>
        <button @click="connectWallet" class="btn-primary">
          连接 MetaMask 钱包
        </button>
      </div>

      <!-- Connected State -->
      <div v-else>
        <!-- Wallet Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="card-dark p-8">
            <h2 class="text-lg font-bold text-[#c4b5fd] mb-4">钱包信息</h2>
            <div class="space-y-4">
              <div>
                <p class="text-sm text-gray-400">地址</p>
                <p class="text-[#a78bfa] font-mono break-all">{{ walletStore.account }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">余额</p>
                <p class="text-2xl font-bold text-[#a78bfa]">{{ walletStore.balance }} ETH</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">链 ID</p>
                <p class="text-[#a78bfa]">{{ walletStore.chainId }}</p>
              </div>
            </div>
          </div>

          <div class="card-dark p-8">
            <h2 class="text-lg font-bold text-[#c4b5fd] mb-4">快速操作</h2>
            <div class="space-y-3">
              <button @click="switchToBSC" class="btn-primary w-full">
                切换到 BSC 测试网
              </button>
              <button @click="refreshBalance" class="btn-secondary w-full">
                刷新余额
              </button>
              <button @click="disconnectWallet" class="btn-secondary w-full text-red-400">
                断开连接
              </button>
            </div>
          </div>
        </div>

        <!-- Holdings -->
        <div class="card-dark p-8 mb-8">
          <h2 class="text-lg font-bold text-[#c4b5fd] mb-6">我的持仓</h2>
          <div v-if="holdings.length === 0" class="text-center py-8">
            <p class="text-gray-400">暂无持仓</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-[#3d2f52]">
                  <th class="text-left py-3 text-[#a78bfa]">市场</th>
                  <th class="text-left py-3 text-[#a78bfa]">选项</th>
                  <th class="text-right py-3 text-[#a78bfa]">数量</th>
                  <th class="text-right py-3 text-[#a78bfa]">价值</th>
                </tr>
              </thead>
              <tbody>
            <tr v-for="holding in tradeStore.holdings" :key="holding.id" class="border-b border-[#3d2f52]">
              <td class="py-3 text-gray-300">{{ holding.market }}</td>
              <td class="py-3 text-gray-300">{{ holding.option }}</td>
              <td class="py-3 text-right text-[#a78bfa]">{{ holding.quantity }}</td>
              <td class="py-3 text-right" :class="tradeStore.calculateProfit(holding) >= 0 ? 'text-green-400' : 'text-red-400'">
                ${{ holding.currentValue }}
                <span class="text-xs ml-1">({{ tradeStore.calculateROI(holding) }}%)</span>
              </td>
            </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Trading History -->
        <div class="card-dark p-8">
          <h2 class="text-lg font-bold text-[#c4b5fd] mb-6">交易历史</h2>
          <div v-if="tradingHistory.length === 0" class="text-center py-8">
            <p class="text-gray-400">暂无交易历史</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-[#3d2f52]">
                  <th class="text-left py-3 text-[#a78bfa]">时间</th>
                  <th class="text-left py-3 text-[#a78bfa]">市场</th>
                  <th class="text-left py-3 text-[#a78bfa]">类型</th>
                  <th class="text-right py-3 text-[#a78bfa]">数量</th>
                  <th class="text-right py-3 text-[#a78bfa]">价格</th>
                </tr>
              </thead>
              <tbody>
            <tr v-for="trade in tradeStore.trades" :key="trade.id" class="border-b border-[#3d2f52]">
              <td class="py-3 text-gray-300">{{ formatDate(trade.timestamp) }}</td>
              <td class="py-3 text-gray-300">{{ trade.market }}</td>
              <td class="py-3">
                <span :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  trade.type === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                ]">
                  {{ trade.type }}
                </span>
              </td>
              <td class="py-3 text-right text-[#a78bfa]">{{ trade.quantity }}</td>
              <td class="py-3 text-right text-[#a78bfa]">${{ trade.price }}</td>
            </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWalletStore } from '../stores/wallet'
import { useTradeStore } from '../stores/trade'

const walletStore = useWalletStore()
const tradeStore = useTradeStore()
const holdings = ref([])
const tradingHistory = ref([])

const connectWallet = async () => {
  await walletStore.connectWallet()
}

const disconnectWallet = () => {
  walletStore.disconnectWallet()
}

const switchToBSC = async () => {
  // BSC Testnet Chain ID: 97
  const success = await walletStore.switchToNetwork(97)
  if (success) {
    alert('已切换到 BSC 测试网')
  } else {
    alert('切换网络失败，请手动在 MetaMask 中切换')
  }
}

const refreshBalance = async () => {
  if (walletStore.isConnected) {
    const balanceWei = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [walletStore.account, 'latest']
    })
    walletStore.balance = (parseInt(balanceWei, 16) / 1e18).toFixed(4)
  }
}

const formatDate = (date) => {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  if (walletStore.isConnected) {
    // 从 API 获取用户数据
    await tradeStore.fetchUserHoldings(walletStore.account)
    await tradeStore.fetchUserTrades(walletStore.account)
    
    // 监听数据变化
    holdings.value = tradeStore.holdings
    tradingHistory.value = tradeStore.trades
  }
})
</script>

<style scoped>
</style>

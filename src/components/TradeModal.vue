<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-[#2a1f3d] border border-[#3d2f52] rounded-lg p-8 max-w-md w-full mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-[#c4b5fd]">
          购买 {{ option === 'yes' ? 'YES' : 'NO' }}
        </h2>
        <button @click="closeModal" class="text-gray-400 hover:text-[#a78bfa]">
          ✕
        </button>
      </div>

      <!-- Market Info -->
      <div class="bg-[#1a1428] border border-[#3d2f52] rounded p-4 mb-6">
        <p class="text-xs text-gray-400 mb-1">市场</p>
        <p class="text-sm text-gray-200 line-clamp-2">{{ market?.question }}</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-900 bg-opacity-30 border border-red-700 rounded p-3 mb-6">
        <p class="text-red-300 text-sm">{{ error }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitTrade" class="space-y-4">
        <!-- Current Price -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">当前价格</label>
          <div class="bg-[#1a1428] border border-[#3d2f52] rounded p-3">
            <p class="text-lg font-bold text-[#a78bfa]">
              ${{ currentPrice.toFixed(2) }}
            </p>
          </div>
        </div>

        <!-- Quantity -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">购买数量</label>
          <input
            v-model.number="quantity"
            type="number"
            min="1"
            step="1"
            placeholder="输入购买数量"
            class="w-full px-3 py-2 bg-[#1a1428] border border-[#3d2f52] rounded text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#a78bfa]"
          />
        </div>

        <!-- Total Cost -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">总成本</label>
          <div class="bg-[#1a1428] border border-[#3d2f52] rounded p-3">
            <p class="text-lg font-bold text-[#a78bfa]">
              ${{ (quantity * currentPrice).toFixed(2) }}
            </p>
          </div>
        </div>

        <!-- Wallet Balance -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">钱包余额</label>
          <div class="bg-[#1a1428] border border-[#3d2f52] rounded p-3">
            <p class="text-sm text-[#a78bfa]">
              {{ walletStore.balance }} {{ walletStore.getNetworkSymbol(walletStore.chainId) }}
            </p>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="flex-1 btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="isLoading || quantity <= 0"
            :class="[
              'flex-1 py-2 px-4 rounded font-bold transition-all',
              option === 'yes'
                ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white'
                : 'bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white'
            ]"
          >
            {{ isLoading ? '处理中...' : '确认购买' }}
          </button>
        </div>
      </form>

      <!-- Info -->
      <div class="bg-[#1a1428] border border-[#3d2f52] rounded p-4 mt-6">
        <p class="text-xs text-gray-400 mb-2">💡 提示</p>
        <ul class="text-xs text-gray-400 space-y-1">
          <li>• 购买后可随时卖出</li>
          <li>• 市场关闭后将进行结算</li>
          <li>• 确保钱包中有足够的余额</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useWalletStore } from '../stores/wallet'
import { useTradeStore } from '../stores/trade'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  market: {
    type: Object,
    default: null
  },
  option: {
    type: String,
    enum: ['yes', 'no'],
    default: 'yes'
  }
})

const emit = defineEmits(['close', 'success'])

const walletStore = useWalletStore()
const tradeStore = useTradeStore()

const quantity = ref(1)
const error = ref(null)
const isLoading = ref(false)

const currentPrice = computed(() => {
  if (!props.market) return 0
  if (props.option === 'yes') {
    return props.market.impliedProbability?.yes || 0.5
  } else {
    return props.market.impliedProbability?.no || 0.5
  }
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    quantity.value = 1
    error.value = null
  }
})

const closeModal = () => {
  emit('close')
}

const submitTrade = async () => {
  try {
    error.value = null
    isLoading.value = true

    if (!walletStore.isConnected) {
      error.value = '请先连接钱包'
      return
    }

    if (quantity.value <= 0) {
      error.value = '购买数量必须大于 0'
      return
    }

    // 调用交易 API
    const result = await tradeStore.buyShares(
      props.market.marketId,
      props.option,
      quantity.value,
      currentPrice.value,
      walletStore.account
    )

    if (result) {
      emit('success')
      closeModal()
    } else {
      error.value = tradeStore.error || '交易失败'
    }
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
</style>

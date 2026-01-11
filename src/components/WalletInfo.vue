<template>
  <div v-if="walletStore.isConnected" class="flex items-center gap-4">
    <!-- Balance -->
    <div class="hidden sm:flex flex-col items-end">
      <p class="text-xs text-gray-400">余额</p>
      <p class="text-sm font-semibold text-[#a78bfa]">
        {{ walletStore.balance }} {{ walletStore.getNetworkSymbol(walletStore.chainId) }}
      </p>
    </div>

    <!-- Network -->
    <div class="hidden sm:flex flex-col items-end">
      <p class="text-xs text-gray-400">网络</p>
      <p class="text-sm font-semibold text-[#a78bfa]">
        {{ walletStore.chainName }}
      </p>
    </div>

    <!-- Account Dropdown -->
    <div class="relative">
      <button
        @click="isDropdownOpen = !isDropdownOpen"
        class="px-3 py-2 bg-[#2a1f3d] border border-[#3d2f52] rounded hover:border-[#a78bfa] transition-all text-[#a78bfa] text-sm font-medium"
      >
        {{ walletStore.shortAddress }}
      </button>

      <!-- Dropdown Menu -->
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 mt-2 w-48 bg-[#2a1f3d] border border-[#3d2f52] rounded shadow-lg z-40"
      >
        <div class="p-3 border-b border-[#3d2f52]">
          <p class="text-xs text-gray-400 mb-1">账户</p>
          <p class="text-sm font-mono text-[#a78bfa] break-all">{{ walletStore.account }}</p>
        </div>

        <div class="p-3 border-b border-[#3d2f52]">
          <p class="text-xs text-gray-400 mb-2">切换网络</p>
          <div class="space-y-1">
            <button
              v-for="(network, id) in networks"
              :key="id"
              @click="switchNetwork(parseInt(id))"
              :class="[
                'w-full text-left px-2 py-1 text-xs rounded transition-all',
                walletStore.chainId === parseInt(id)
                  ? 'bg-[#a78bfa] text-[#0f0a1a]'
                  : 'text-gray-300 hover:bg-[#1a1428]'
              ]"
            >
              {{ network.name }}
            </button>
          </div>
        </div>

        <button
          @click="copyAddress"
          class="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#1a1428] transition-all"
        >
          📋 复制地址
        </button>

        <button
          @click="openExplorer"
          class="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-[#1a1428] transition-all border-b border-[#3d2f52]"
        >
          🔗 在浏览器中查看
        </button>

        <button
          @click="disconnect"
          class="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-900 hover:bg-opacity-20 transition-all"
        >
          🚪 断开连接
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWalletStore } from '../stores/wallet'

const walletStore = useWalletStore()
const isDropdownOpen = ref(false)

const networks = {
  1: { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io' },
  5: { name: 'Goerli Testnet', explorer: 'https://goerli.etherscan.io' },
  56: { name: 'BSC Mainnet', explorer: 'https://bscscan.com' },
  97: { name: 'BSC Testnet', explorer: 'https://testnet.bscscan.com' },
  137: { name: 'Polygon', explorer: 'https://polygonscan.com' }
}

const switchNetwork = async (chainId) => {
  const success = await walletStore.switchToNetwork(chainId)
  if (success) {
    isDropdownOpen.value = false
  }
}

const copyAddress = () => {
  navigator.clipboard.writeText(walletStore.account)
  alert('地址已复制到剪贴板')
}

const openExplorer = () => {
  const network = networks[walletStore.chainId]
  if (network) {
    window.open(`${network.explorer}/address/${walletStore.account}`, '_blank')
  }
}

const disconnect = () => {
  walletStore.disconnectWallet()
  isDropdownOpen.value = false
}
</script>

<style scoped>
</style>

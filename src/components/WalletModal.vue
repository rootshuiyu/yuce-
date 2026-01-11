<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-[#2a1f3d] border border-[#3d2f52] rounded-lg p-8 max-w-md w-full mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-[#c4b5fd]">连接钱包</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-[#a78bfa]">
          ✕
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="walletStore.error" class="bg-red-900 bg-opacity-30 border border-red-700 rounded p-3 mb-6">
        <p class="text-red-300 text-sm">{{ walletStore.error }}</p>
      </div>

      <!-- MetaMask Not Installed -->
      <div v-if="!walletStore.isMetaMaskInstalled" class="text-center">
        <p class="text-gray-300 mb-4">MetaMask 未安装</p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block btn-primary"
        >
          下载 MetaMask
        </a>
      </div>

      <!-- Connect Options -->
      <div v-else class="space-y-3">
        <!-- MetaMask Option -->
        <button
          @click="connectMetaMask"
          :disabled="walletStore.isLoading"
          class="w-full p-4 bg-[#1a1428] border border-[#3d2f52] rounded hover:border-[#a78bfa] transition-all flex items-center gap-3 disabled:opacity-50"
        >
          <div class="w-10 h-10 bg-[#f6851b] rounded flex items-center justify-center flex-shrink-0">
            <span class="text-white font-bold text-sm">M</span>
          </div>
          <div class="text-left">
            <p class="font-semibold text-gray-200">MetaMask</p>
            <p class="text-xs text-gray-400">连接您的 MetaMask 钱包</p>
          </div>
          <span v-if="walletStore.isLoading" class="ml-auto text-[#a78bfa]">⏳</span>
        </button>

        <!-- Info -->
        <div class="bg-[#1a1428] border border-[#3d2f52] rounded p-4 mt-6">
          <p class="text-xs text-gray-400 mb-2">💡 提示</p>
          <ul class="text-xs text-gray-400 space-y-1">
            <li>• 确保已安装 MetaMask 浏览器扩展</li>
            <li>• 支持 BSC、Ethereum、Polygon 等网络</li>
            <li>• 您的私钥永远不会被分享</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useWalletStore } from '../stores/wallet'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'connected'])

const walletStore = useWalletStore()

const closeModal = () => {
  emit('close')
}

const connectMetaMask = async () => {
  const success = await walletStore.connectWallet()
  if (success) {
    emit('connected')
    closeModal()
  }
}
</script>

<style scoped>
</style>

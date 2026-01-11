<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-[#1a1428] border-b border-[#3d2f52]">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 font-bold text-xl text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">
        <span>🎯 Super Truth</span>
      </router-link>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-6">
        <router-link to="/" class="text-gray-300 hover:text-[#a78bfa] transition-colors">
          市场
        </router-link>
        <a href="#" class="text-gray-300 hover:text-[#a78bfa] transition-colors">
          排行榜
        </a>
        <a href="#" class="text-gray-300 hover:text-[#a78bfa] transition-colors">
          关于
        </a>
      </div>

      <!-- Desktop Actions -->
      <div class="hidden md:flex items-center gap-3">
        <WalletInfo />
        <button v-if="!walletStore.isConnected" @click="handleConnect" class="btn-primary">
          连接钱包
        </button>
        <router-link to="/user" class="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">
          👤
        </router-link>
      </div>

      <!-- Mobile Menu Button -->
      <button class="md:hidden text-[#a78bfa]" @click="mobileMenuOpen = !mobileMenuOpen">
        <span v-if="!mobileMenuOpen">☰</span>
        <span v-else>✕</span>
      </button>
    </div>

    <!-- Mobile Navigation -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-[#3d2f52] bg-[#1a1428]">
      <div class="px-4 py-4 flex flex-col gap-4">
        <router-link to="/" class="text-gray-300 hover:text-[#a78bfa] transition-colors">
          市场
        </router-link>
        <a href="#" class="text-gray-300 hover:text-[#a78bfa] transition-colors">
          排行榜
        </a>
        <a href="#" class="text-gray-300 hover:text-[#a78bfa] transition-colors">
          关于
        </a>
        <button v-if="!walletStore.isConnected" @click="handleConnect" class="btn-primary w-full">
          连接钱包
        </button>
        <div v-else class="flex flex-col gap-2 bg-[#2a1f3d] p-3 rounded border border-[#3d2f52]">
          <p class="text-xs text-gray-400">已连接账户</p>
          <p class="text-sm font-mono text-[#a78bfa] break-all">{{ walletStore.account }}</p>
          <p class="text-xs text-gray-400 mt-2">{{ walletStore.chainName }}</p>
        </div>
        <router-link to="/user" class="text-[#a78bfa] hover:text-[#c4b5fd] transition-colors">
          用户中心
        </router-link>
      </div>
    </div>

    <!-- Wallet Modal -->
    <WalletModal :isOpen="showWalletModal" @close="showWalletModal = false" @connected="handleWalletConnected" />
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWalletStore } from '../stores/wallet'
import WalletModal from './WalletModal.vue'
import WalletInfo from './WalletInfo.vue'

const walletStore = useWalletStore()
const mobileMenuOpen = ref(false)
const showWalletModal = ref(false)

const handleConnect = () => {
  showWalletModal.value = true
}

const handleWalletConnected = () => {
  mobileMenuOpen.value = false
}

onMounted(() => {
  // 检查钱包是否已连接
  walletStore.checkIfWalletIsConnected()
})
</script>

<style scoped>
</style>

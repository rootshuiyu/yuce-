import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWalletStore = defineStore('wallet', () => {
  const account = ref(null)
  const isConnected = ref(false)
  const balance = ref('0')
  const chainId = ref(null)
  const chainName = ref('')
  const error = ref(null)
  const isLoading = ref(false)

  // 支持的网络配置
  const NETWORKS = {
    1: { name: 'Ethereum Mainnet', symbol: 'ETH' },
    5: { name: 'Goerli Testnet', symbol: 'ETH' },
    56: { name: 'BSC Mainnet', symbol: 'BNB' },
    97: { name: 'BSC Testnet', symbol: 'BNB' },
    137: { name: 'Polygon', symbol: 'MATIC' }
  }

  const getNetworkName = (id) => {
    return NETWORKS[id]?.name || `Unknown Network (${id})`
  }

  const getNetworkSymbol = (id) => {
    return NETWORKS[id]?.symbol || 'UNKNOWN'
  }

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        error.value = 'MetaMask 未安装'
        return false
      }

      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      })

      if (accounts.length > 0) {
        account.value = accounts[0]
        isConnected.value = true
        
        // 获取链信息
        const chainIdHex = await window.ethereum.request({
          method: 'eth_chainId'
        })
        chainId.value = parseInt(chainIdHex, 16)
        chainName.value = getNetworkName(chainId.value)
        
        // 获取余额
        await updateBalance()
        
        // 设置事件监听
        setupEventListeners()
        
        return true
      }
      return false
    } catch (err) {
      error.value = err.message
      console.error('Failed to check wallet connection:', err)
      return false
    }
  }

  const connectWallet = async () => {
    try {
      isLoading.value = true
      error.value = null

      if (typeof window.ethereum === 'undefined') {
        error.value = 'MetaMask 未安装，请先安装 MetaMask 浏览器扩展'
        return false
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        account.value = accounts[0]
        isConnected.value = true

        // 获取链 ID
        const chainIdHex = await window.ethereum.request({
          method: 'eth_chainId'
        })
        chainId.value = parseInt(chainIdHex, 16)
        chainName.value = getNetworkName(chainId.value)

        // 获取余额
        await updateBalance()

        // 设置事件监听
        setupEventListeners()

        return true
      }
      return false
    } catch (error) {
      if (error.code === 4001) {
        error.value = '用户拒绝了连接请求'
      } else {
        error.value = error.message
      }
      console.error('Failed to connect wallet:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const disconnectWallet = () => {
    account.value = null
    isConnected.value = false
    balance.value = '0'
    chainId.value = null
    chainName.value = ''
    error.value = null
    removeEventListeners()
  }

  const updateBalance = async () => {
    try {
      if (!account.value) return

      const balanceWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [account.value, 'latest']
      })
      balance.value = (parseInt(balanceWei, 16) / 1e18).toFixed(4)
    } catch (err) {
      console.error('Failed to update balance:', err)
    }
  }

  const switchToNetwork = async (targetChainId) => {
    try {
      isLoading.value = true
      error.value = null

      const chainIdHex = '0x' + targetChainId.toString(16)
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }]
        })
        chainId.value = targetChainId
        chainName.value = getNetworkName(targetChainId)
        return true
      } catch (switchError) {
        // 如果网络不存在，尝试添加网络
        if (switchError.code === 4902) {
          return await addNetwork(targetChainId)
        }
        throw switchError
      }
    } catch (err) {
      error.value = `切换网络失败: ${err.message}`
      console.error('Failed to switch network:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const addNetwork = async (chainId) => {
    try {
      const networkConfig = {
        56: {
          chainId: '0x38',
          chainName: 'Binance Smart Chain',
          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
          rpcUrls: ['https://bsc-dataseed1.binance.org:8545'],
          blockExplorerUrls: ['https://bscscan.com']
        },
        97: {
          chainId: '0x61',
          chainName: 'BSC Testnet',
          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
          rpcUrls: ['https://data-seed-prebsc-1-b.binance.org:8545'],
          blockExplorerUrls: ['https://testnet.bscscan.com']
        }
      }

      const config = networkConfig[chainId]
      if (!config) {
        throw new Error('不支持的网络')
      }

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [config]
      })

      chainId.value = chainId
      chainName.value = getNetworkName(chainId)
      return true
    } catch (err) {
      error.value = `添加网络失败: ${err.message}`
      console.error('Failed to add network:', err)
      return false
    }
  }

  const setupEventListeners = () => {
    if (typeof window.ethereum === 'undefined') return

    // 监听账户变更
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        account.value = accounts[0]
        updateBalance()
      } else {
        disconnectWallet()
      }
    })

    // 监听链变更
    window.ethereum.on('chainChanged', (chainIdHex) => {
      chainId.value = parseInt(chainIdHex, 16)
      chainName.value = getNetworkName(chainId.value)
      updateBalance()
    })

    // 监听连接状态
    window.ethereum.on('connect', (connectInfo) => {
      console.log('Wallet connected:', connectInfo)
    })

    // 监听断开连接
    window.ethereum.on('disconnect', (error) => {
      console.log('Wallet disconnected:', error)
      disconnectWallet()
    })
  }

  const removeEventListeners = () => {
    if (typeof window.ethereum === 'undefined') return

    window.ethereum.removeAllListeners('accountsChanged')
    window.ethereum.removeAllListeners('chainChanged')
    window.ethereum.removeAllListeners('connect')
    window.ethereum.removeAllListeners('disconnect')
  }

  const signMessage = async (message) => {
    try {
      if (!account.value) {
        throw new Error('钱包未连接')
      }

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account.value]
      })

      return signature
    } catch (err) {
      error.value = `签名失败: ${err.message}`
      console.error('Failed to sign message:', err)
      return null
    }
  }

  const sendTransaction = async (to, value, data = '0x') => {
    try {
      if (!account.value) {
        throw new Error('钱包未连接')
      }

      isLoading.value = true
      error.value = null

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account.value,
            to,
            value: value ? '0x' + parseInt(value).toString(16) : '0x0',
            data
          }
        ]
      })

      return txHash
    } catch (err) {
      error.value = `交易失败: ${err.message}`
      console.error('Failed to send transaction:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const shortAddress = computed(() => {
    if (!account.value) return ''
    return `${account.value.substring(0, 6)}...${account.value.substring(38)}`
  })

  const isMetaMaskInstalled = computed(() => {
    return typeof window.ethereum !== 'undefined'
  })

  return {
    // State
    account,
    isConnected,
    balance,
    chainId,
    chainName,
    error,
    isLoading,
    
    // Computed
    shortAddress,
    isMetaMaskInstalled,
    
    // Methods
    checkIfWalletIsConnected,
    connectWallet,
    disconnectWallet,
    updateBalance,
    switchToNetwork,
    addNetwork,
    signMessage,
    sendTransaction,
    getNetworkName,
    getNetworkSymbol
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = '/api'

export const useTradeStore = defineStore('trade', () => {
  const trades = ref([])
  const holdings = ref([])
  const loading = ref(false)
  const error = ref(null)

  const buyShares = async (marketId, option, quantity, price, userAddress) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/trades/buy`, {
        marketId,
        option,
        quantity,
        price,
        userAddress
      })

      if (response.data.success) {
        trades.value.unshift(response.data.data)
        return response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Failed to buy shares:', err)
    } finally {
      loading.value = false
    }
  }

  const sellShares = async (marketId, option, quantity, price, userAddress) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/trades/sell`, {
        marketId,
        option,
        quantity,
        price,
        userAddress
      })

      if (response.data.success) {
        trades.value.unshift(response.data.data)
        return response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Failed to sell shares:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUserTrades = async (userAddress) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/trades/user/${userAddress}`)
      if (response.data.success) {
        trades.value = response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Failed to fetch trades:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUserHoldings = async (userAddress) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/trades/holdings/user/${userAddress}`)
      if (response.data.success) {
        holdings.value = response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      console.error('Failed to fetch holdings:', err)
    } finally {
      loading.value = false
    }
  }

  const calculateProfit = (holding) => {
    if (!holding) return 0
    return (holding.currentValue - holding.costBasis).toFixed(2)
  }

  const calculateROI = (holding) => {
    if (!holding || holding.costBasis === 0) return 0
    return ((holding.currentValue - holding.costBasis) / holding.costBasis * 100).toFixed(2)
  }

  return {
    trades,
    holdings,
    loading,
    error,
    buyShares,
    sellShares,
    fetchUserTrades,
    fetchUserHoldings,
    calculateProfit,
    calculateROI
  }
})

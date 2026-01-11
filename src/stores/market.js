import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

export const useMarketStore = defineStore('market', () => {
  const markets = ref([])
  const currentMarket = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchMarkets = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const response = await axios.get(`${API_URL}/markets?${params}`)
      if (response.data.success) {
        markets.value = response.data.data
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch markets:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchMarketById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/markets/${id}`)
      if (response.data.success) {
        currentMarket.value = response.data.data
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch market:', err)
    } finally {
      loading.value = false
    }
  }

  const createMarket = async (marketData) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/markets`, marketData)
      if (response.data.success) {
        markets.value.unshift(response.data.data)
        return response.data.data
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to create market:', err)
    } finally {
      loading.value = false
    }
  }

  const generateTestData = async (count = 10) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/markets/generate-test-data`, { count })
      if (response.data.success) {
        await fetchMarkets()
        return response.data.data
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to generate test data:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    markets,
    currentMarket,
    loading,
    error,
    fetchMarkets,
    fetchMarketById,
    createMarket,
    generateTestData
  }
})

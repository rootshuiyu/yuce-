import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// 配置 axios 使用相对 URL
const axiosInstance = axios.create({
  baseURL: '/',
  timeout: 10000
})

const API_URL = '/api'

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

      console.log(`[Market Store] 正在获取市场数据: ${API_URL}/markets?${params}`)
      
      const response = await axiosInstance.get(`${API_URL}/markets?${params}`)
      
      console.log('[Market Store] API 响应:', response.data)
      
      if (response.data.success && Array.isArray(response.data.data)) {
        markets.value = response.data.data
        console.log(`[Market Store] 成功加载 ${markets.value.length} 个市场`)
      } else {
        throw new Error('API 返回数据格式错误')
      }
    } catch (err) {
      error.value = err.message
      console.error('[Market Store] 获取市场失败:', err)
      markets.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchMarketById = async (id) => {
    loading.value = true
    error.value = null
    try {
      console.log(`[Market Store] 正在获取市场详情: ${API_URL}/markets/${id}`)
      
      const response = await axiosInstance.get(`${API_URL}/markets/${id}`)
      
      if (response.data.success) {
        currentMarket.value = response.data.data
        console.log('[Market Store] 成功加载市场详情:', currentMarket.value)
      } else {
        throw new Error('API 返回数据格式错误')
      }
    } catch (err) {
      error.value = err.message
      console.error('[Market Store] 获取市场详情失败:', err)
      currentMarket.value = null
    } finally {
      loading.value = false
    }
  }

  const createMarket = async (marketData) => {
    loading.value = true
    error.value = null
    try {
      console.log('[Market Store] 正在创建市场:', marketData)
      
      const response = await axiosInstance.post(`${API_URL}/markets`, marketData)
      
      if (response.data.success) {
        markets.value.unshift(response.data.data)
        console.log('[Market Store] 市场创建成功')
        return response.data.data
      } else {
        throw new Error('API 返回数据格式错误')
      }
    } catch (err) {
      error.value = err.message
      console.error('[Market Store] 创建市场失败:', err)
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
    createMarket
  }
})

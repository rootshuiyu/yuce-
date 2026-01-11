import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useMarketStore = defineStore('market', () => {
  const markets = ref([])
  const currentMarket = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 生成本地测试市场数据
  const generateLocalTestMarkets = (count = 20) => {
    const categories = [
      { id: 'cat_politics', name: '政治', icon: '🏛️' },
      { id: 'cat_sports', name: '体育', icon: '⚽' },
      { id: 'cat_crypto', name: '加密', icon: '₿' },
      { id: 'cat_finance', name: '金融', icon: '💰' },
      { id: 'cat_tech', name: '科技', icon: '💻' },
      { id: 'cat_culture', name: '文化', icon: '🎭' },
      { id: 'cat_climate', name: '气候', icon: '🌍' },
      { id: 'cat_world', name: '世界', icon: '🌐' }
    ]

    const subcategories = {
      cat_politics: ['美国选举', '欧洲政治', '亚洲政治'],
      cat_sports: ['足球', '篮球', '网球'],
      cat_crypto: ['比特币', '以太坊', 'DeFi'],
      cat_finance: ['股票市场', '美元指数', '黄金价格'],
      cat_tech: ['AI发展', '科技股', '芯片'],
      cat_culture: ['电影票房', '音乐排行', '游戏'],
      cat_climate: ['全球温度', '碳排放', '绿能'],
      cat_world: ['地缘政治', '贸易战', '难民']
    }

    const questions = [
      '${year}年${category}会发生什么？',
      '${category}在${year}年会上涨吗？',
      '${category}${year}年的表现会超过预期吗？',
      '${category}会在${year}年创新高吗？',
      '${category}${year}年会面临挑战吗？',
      '${category}在${year}年会保持增长吗？',
      '${category}${year}年的前景如何？',
      '${category}会在${year}年成为焦点吗？'
    ]

    const newMarkets = []
    const now = new Date()

    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const subcategoryList = subcategories[category.id]
      const subcategory = subcategoryList[Math.floor(Math.random() * subcategoryList.length)]
      const questionTemplate = questions[Math.floor(Math.random() * questions.length)]
      const year = 2024 + Math.floor(Math.random() * 3)

      const question = questionTemplate
        .replace('${category}', subcategory)
        .replace('${year}', year)

      const yesProb = Math.random()
      const noProb = 1 - yesProb

      const endDate = new Date(now.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000)

      newMarkets.push({
        id: `market_${Date.now()}_${i}`,
        question,
        category: category.name,
        subcategory,
        categoryId: category.id,
        subcategoryId: `subcat_${category.id}_${i}`,
        impliedProbability: {
          yes: yesProb,
          no: noProb
        },
        totalVolume: Math.floor(Math.random() * 1000000) + 10000,
        status: Math.random() > 0.3 ? 'active' : 'ended',
        endDate: endDate.toISOString(),
        createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        liquidity: Math.floor(Math.random() * 500000) + 5000,
        traders: Math.floor(Math.random() * 1000) + 50
      })
    }

    return newMarkets
  }

  const fetchMarkets = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      // 首先尝试从 API 获取
      try {
        const params = new URLSearchParams()
        if (filters.status) params.append('status', filters.status)
        if (filters.search) params.append('search', filters.search)

        const response = await axios.get(`${API_URL}/markets?${params}`)
        if (response.data.success) {
          markets.value = response.data.data
          return
        }
      } catch (apiError) {
        console.warn('API 获取失败，使用本地测试数据:', apiError.message)
      }

      // 如果 API 失败，使用本地测试数据
      markets.value = generateLocalTestMarkets(20)
    } catch (err) {
      error.value = err.message
      console.error('Failed to fetch markets:', err)
      // 最后的备选方案
      markets.value = generateLocalTestMarkets(20)
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

  const generateTestData = async (count = 20) => {
    loading.value = true
    error.value = null
    try {
      // 首先尝试从 API 生成
      try {
        const response = await axios.post(`${API_URL}/markets/generate-test-data`, { count })
        if (response.data.success) {
          await fetchMarkets()
          return response.data.data
        }
      } catch (apiError) {
        console.warn('API 生成失败，使用本地生成:', apiError.message)
      }

      // 使用本地生成
      markets.value = generateLocalTestMarkets(count)
    } catch (err) {
      error.value = err.message
      console.error('Failed to generate test data:', err)
      // 最后的备选方案
      markets.value = generateLocalTestMarkets(count)
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
    generateTestData,
    generateLocalTestMarkets
  }
})

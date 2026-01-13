// API 服务层 - 生产级别
import { ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const CACHE_TTL = import.meta.env.VITE_CACHE_TTL || 3600
const CACHE_ENABLED = import.meta.env.VITE_CACHE_ENABLED !== 'false'

// 简单的内存缓存
const cache = new Map()
const cacheTimestamps = new Map()

const isCacheValid = (key) => {
  if (!CACHE_ENABLED) return false
  const timestamp = cacheTimestamps.get(key)
  if (!timestamp) return false
  return Date.now() - timestamp < CACHE_TTL * 1000
}

const getFromCache = (key) => {
  if (isCacheValid(key)) {
    return cache.get(key)
  }
  cache.delete(key)
  cacheTimestamps.delete(key)
  return null
}

const setCache = (key, value) => {
  if (CACHE_ENABLED) {
    cache.set(key, value)
    cacheTimestamps.set(key, Date.now())
  }
}

// 错误处理
class APIError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

// 请求方法
const request = async (method, endpoint, data = null, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const cacheKey = `${method}:${endpoint}`

  // 检查缓存
  if (method === 'GET') {
    const cached = getFromCache(cacheKey)
    if (cached) {
      return cached
    }
  }

  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data)
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new APIError(
        error.message || `HTTP ${response.status}`,
        response.status,
        error
      )
    }

    const result = await response.json()

    // 缓存成功的 GET 请求
    if (method === 'GET') {
      setCache(cacheKey, result)
    }

    return result
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error)
    throw error
  }
}

// API 方法
export const api = {
  // 分类
  getCategories: () => request('GET', '/api/categories'),
  getCategoryMarkets: (categoryId) => request('GET', `/api/categories/${categoryId}/markets`),
  getSubcategories: (categoryId) => request('GET', `/api/categories/${categoryId}/subcategories`),

  // 市场
  getMarkets: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `/api/markets?${query}` : '/api/markets'
    return request('GET', endpoint)
  },
  getMarket: (marketId) => request('GET', `/api/markets/${marketId}`),
  createMarket: (data) => request('POST', '/api/markets', data),
  updateMarket: (marketId, data) => request('PUT', `/api/markets/${marketId}`, data),

  // 交易
  getTrades: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const endpoint = query ? `/api/trades?${query}` : '/api/trades'
    return request('GET', endpoint)
  },
  createTrade: (data) => request('POST', '/api/trades', data),

  // 认证
  login: (data) => request('POST', '/api/auth/login', data),
  logout: () => request('POST', '/api/auth/logout'),
  verify: (token) => request('POST', '/api/auth/verify', { token }),

  // 健康检查
  health: () => request('GET', '/health'),
}

// 清除缓存
export const clearCache = (pattern = null) => {
  if (!pattern) {
    cache.clear()
    cacheTimestamps.clear()
  } else {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
        cacheTimestamps.delete(key)
      }
    }
  }
}

export default api

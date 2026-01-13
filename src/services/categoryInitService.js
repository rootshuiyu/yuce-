/**
 * 分类初始化服务
 * 在应用启动时初始化分类数据
 */

const API_URL = '/api'

export const categoryInitService = {
  /**
   * 初始化分类数据
   * 1. 检查是否已初始化
   * 2. 如果未初始化，调用初始化 API
   */
  async initializeCategories() {
    try {
      // 检查本地存储中是否已初始化
      const initialized = localStorage.getItem('categories_initialized')
      
      if (!initialized) {
        console.log('开始初始化分类数据...')
        
        // 调用初始化 API
        const response = await fetch(`${API_URL}/categories/init/default`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (!response.ok) {
          throw new Error('分类初始化失败')
        }
        
        const data = await response.json()
        console.log('分类初始化成功:', data.data)
        
        // 标记为已初始化
        localStorage.setItem('categories_initialized', 'true')
        localStorage.setItem('categories_init_time', new Date().toISOString())
        
        return data.data
      } else {
        console.log('分类数据已初始化')
        return null
      }
    } catch (error) {
      console.error('分类初始化失败:', error)
      // 不抛出错误，允许应用继续运行
      return null
    }
  },

  /**
   * 重置初始化标记（用于测试）
   */
  resetInitialization() {
    localStorage.removeItem('categories_initialized')
    localStorage.removeItem('categories_init_time')
  },

  /**
   * 检查是否已初始化
   */
  isInitialized() {
    return localStorage.getItem('categories_initialized') === 'true'
  },

  /**
   * 获取初始化时间
   */
  getInitTime() {
    return localStorage.getItem('categories_init_time')
  }
}

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_URL = '/api'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const selectedCategory = ref(null)
  const selectedSubcategory = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // 获取所有分类
  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${API_URL}/categories`)
      if (!response.ok) throw new Error('获取分类失败')
      const data = await response.json()
      categories.value = data.data || []
    } catch (err) {
      error.value = err.message
      console.error('获取分类失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 获取分类详情
  const getCategoryById = async (id) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`)
      if (!response.ok) throw new Error('获取分类详情失败')
      const data = await response.json()
      return data.data
    } catch (err) {
      console.error('获取分类详情失败:', err)
      throw err
    }
  }

  // 获取子分类
  const getSubcategories = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/categories/${categoryId}/subcategories`)
      if (!response.ok) throw new Error('获取子分类失败')
      const data = await response.json()
      return data.data || []
    } catch (err) {
      console.error('获取子分类失败:', err)
      throw err
    }
  }

  // 获取分类下的市场
  const getCategoryMarkets = async (categoryId, options = {}) => {
    try {
      const params = new URLSearchParams({
        status: options.status || 'active',
        sort: options.sort || 'volume',
        limit: options.limit || 50,
        offset: options.offset || 0
      })
      const response = await fetch(`${API_URL}/categories/${categoryId}/markets?${params}`)
      if (!response.ok) throw new Error('获取分类市场失败')
      const data = await response.json()
      return data.data || []
    } catch (err) {
      console.error('获取分类市场失败:', err)
      throw err
    }
  }

  // 创建分类（管理员）
  const createCategory = async (categoryData) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      })
      if (!response.ok) throw new Error('创建分类失败')
      const data = await response.json()
      return data.data
    } catch (err) {
      console.error('创建分类失败:', err)
      throw err
    }
  }

  // 更新分类（管理员）
  const updateCategory = async (categoryId, updateData) => {
    try {
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      if (!response.ok) throw new Error('更新分类失败')
      const data = await response.json()
      return data.data
    } catch (err) {
      console.error('更新分类失败:', err)
      throw err
    }
  }

  // 删除分类（管理员）
  const deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('删除分类失败')
      return true
    } catch (err) {
      console.error('删除分类失败:', err)
      throw err
    }
  }

  // 初始化默认分类
  const initializeDefaultCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/init/default`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('初始化分类失败')
      const data = await response.json()
      // 重新获取分类
      await fetchCategories()
      return data
    } catch (err) {
      console.error('初始化分类失败:', err)
      throw err
    }
  }

  // 计算属性
  const selectedCategoryData = computed(() => {
    if (!selectedCategory.value) return null
    return categories.value.find(cat => cat.id === selectedCategory.value)
  })

  const selectedSubcategoryData = computed(() => {
    if (!selectedCategoryData.value || !selectedSubcategory.value) return null
    return selectedCategoryData.value.subcategories?.find(
      subcat => subcat.id === selectedSubcategory.value
    )
  })

  // 设置选中的分类
  const setSelectedCategory = (categoryId) => {
    selectedCategory.value = categoryId
    selectedSubcategory.value = null
  }

  // 设置选中的子分类
  const setSelectedSubcategory = (subcategoryId) => {
    selectedSubcategory.value = subcategoryId
  }

  // 清除选择
  const clearSelection = () => {
    selectedCategory.value = null
    selectedSubcategory.value = null
  }

  return {
    categories,
    selectedCategory,
    selectedSubcategory,
    loading,
    error,
    fetchCategories,
    getCategoryById,
    getSubcategories,
    getCategoryMarkets,
    createCategory,
    updateCategory,
    deleteCategory,
    initializeDefaultCategories,
    selectedCategoryData,
    selectedSubcategoryData,
    setSelectedCategory,
    setSelectedSubcategory,
    clearSelection
  }
})

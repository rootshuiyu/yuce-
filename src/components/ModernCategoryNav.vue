<template>
  <aside class="modern-sidebar">
    <div class="sidebar-content">
      <!-- 一级分类 -->
      <div class="categories-group">
        <h3 class="group-title">分类</h3>
        
        <!-- 全部分类按钮 -->
        <button
          class="category-item"
          :class="{ active: selectedPrimaryCategory === 'all' }"
          @click="selectPrimaryCategory('all')"
        >
          <span class="category-icon">📊</span>
          <span class="category-label">全部</span>
        </button>

        <!-- 各分类按钮 -->
        <button
          v-for="category in primaryCategories"
          :key="category.id"
          class="category-item"
          :class="{ active: selectedPrimaryCategory === category.id }"
          @click="selectPrimaryCategory(category.id)"
          :title="category.description"
        >
          <span class="category-icon">{{ category.icon }}</span>
          <span class="category-label">{{ category.name }}</span>
        </button>
      </div>

      <!-- 二级分类 -->
      <div v-if="subcategories.length > 0" class="subcategories-group">
        <h3 class="group-title">{{ selectedPrimaryCategoryName }}</h3>
        
        <!-- 全部子分类 -->
        <button
          class="subcategory-item"
          :class="{ active: selectedSubcategory === null }"
          @click="selectSubcategory(null)"
        >
          <span class="subcategory-dot"></span>
          <span class="subcategory-label">全部</span>
        </button>

        <!-- 各子分类按钮 -->
        <button
          v-for="subcat in subcategories"
          :key="subcat.id"
          class="subcategory-item"
          :class="{ active: selectedSubcategory === subcat.id }"
          @click="selectSubcategory(subcat.id)"
          :title="subcat.name"
        >
          <span class="subcategory-dot"></span>
          <span class="subcategory-label">{{ subcat.name }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategoryIcon } from '../utils/categoryIcons'

const selectedPrimaryCategory = ref('cat_politics')
const selectedSubcategory = ref(null)
const primaryCategories = ref([])
const subcategories = ref([])

const selectedPrimaryCategoryName = computed(() => {
  if (selectedPrimaryCategory.value === 'all') return '全部'
  const category = primaryCategories.value.find(c => c.id === selectedPrimaryCategory.value)
  return category?.name || '分类'
})

const emit = defineEmits(['category-changed', 'subcategory-changed'])

const selectPrimaryCategory = async (categoryId) => {
  selectedPrimaryCategory.value = categoryId
  selectedSubcategory.value = null
  emit('category-changed', categoryId)
  
  if (categoryId !== 'all') {
    await loadSubcategories(categoryId)
  } else {
    subcategories.value = []
  }
}

const selectSubcategory = (subcategoryId) => {
  selectedSubcategory.value = subcategoryId
  emit('subcategory-changed', subcategoryId)
}

const loadSubcategories = async (categoryId) => {
  try {
    const response = await fetch(`/api/categories/${categoryId}/subcategories`)
    const data = await response.json()
    subcategories.value = data.data || []
  } catch (error) {
    console.error('获取子分类失败:', error)
    subcategories.value = []
  }
}

onMounted(async () => {
  // 获取一级分类
  try {
    const response = await fetch('/api/categories/primary')
    const data = await response.json()
    primaryCategories.value = data.data || []
    
    // 初始化二级分类
    if (primaryCategories.value.length > 0) {
      await loadSubcategories(selectedPrimaryCategory.value)
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
})
</script>

<style scoped>
.modern-sidebar {
  width: 280px;
  background: linear-gradient(180deg, var(--color-dark-card) 0%, rgba(30, 27, 50, 0.8) 100%);
  border-right: 1px solid var(--color-dark-border);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--color-dark-border) transparent;
  height: 100%;
}

.modern-sidebar::-webkit-scrollbar {
  width: 6px;
}

.modern-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.modern-sidebar::-webkit-scrollbar-thumb {
  background: var(--color-dark-border);
  border-radius: 3px;
}

.sidebar-content {
  padding: 1.5rem 0;
}

.categories-group,
.subcategories-group {
  padding: 0 1rem;
  margin-bottom: 2rem;
}

.group-title {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #4b5563;
  letter-spacing: 0.08em;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.category-item,
.subcategory-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  padding: 0.875rem 0.875rem;
  background: none;
  border: none;
  border-radius: 0.625rem;
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
  overflow: hidden;
}

.category-item:hover,
.subcategory-item:hover {
  background-color: rgba(168, 85, 247, 0.1);
  color: var(--color-purple-light);
  transform: translateX(4px);
  box-shadow: inset 0 0 12px rgba(168, 85, 247, 0.05);
}

.category-item.active,
.subcategory-item.active {
  background: linear-gradient(135deg, var(--color-purple-primary) 0%, #7c3aed 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.35);
  transform: translateX(2px);
}

.category-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(168, 85, 247, 0.12);
  border-radius: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-item:hover .category-icon {
  background: rgba(168, 85, 247, 0.2);
  transform: scale(1.12) rotate(2deg);
}

.category-item.active .category-icon {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.18);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
}

.category-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subcategory-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  background-color: currentColor;
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.subcategory-item:hover .subcategory-dot {
  width: 6px;
  height: 6px;
  opacity: 1;
}

.subcategory-item.active .subcategory-dot {
  width: 7px;
  height: 7px;
  opacity: 1;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
}

.subcategory-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .modern-sidebar {
    width: 240px;
  }

  .category-icon {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 768px) {
  .modern-sidebar {
    width: 200px;
  }

  .categories-group,
  .subcategories-group {
    padding: 0 0.75rem;
    margin-bottom: 1.5rem;
  }

  .category-item,
  .subcategory-item {
    padding: 0.625rem 0.625rem;
    gap: 0.625rem;
  }

  .category-icon {
    width: 28px;
    height: 28px;
    font-size: 1.125rem;
  }

  .category-label,
  .subcategory-label {
    font-size: 0.8125rem;
  }
}
</style>

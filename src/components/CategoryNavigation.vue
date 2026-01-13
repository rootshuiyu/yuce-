<template>
  <div class="category-navigation">
    <!-- 主分类导航 -->
    <div class="primary-categories">
      <button
        v-for="category in primaryCategories"
        :key="category.id"
        :class="['primary-btn', { active: selectedPrimaryId === category.id }]"
        @click="selectPrimaryCategory(category.id)"
      >
        <span class="icon">{{ category.icon }}</span>
        <span class="name">{{ category.name }}</span>
      </button>
    </div>

    <!-- 二级分类导航（水平滚动） -->
    <div v-if="selectedPrimaryCategory && selectedPrimaryCategory.subcategories?.length > 0" class="secondary-categories">
      <div class="secondary-scroll">
        <button
          v-for="subcategory in selectedPrimaryCategory.subcategories"
          :key="subcategory.id"
          :class="['secondary-btn', { active: selectedSubcategoryId === subcategory.id }]"
          @click="selectSubcategory(subcategory.id)"
        >
          {{ subcategory.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategoryStore } from '../stores/category'

const categoryStore = useCategoryStore()
const selectedPrimaryId = ref(null)
const selectedSubcategoryId = ref(null)

const primaryCategories = computed(() => {
  return categoryStore.categories
})

const selectedPrimaryCategory = computed(() => {
  if (!selectedPrimaryId.value) return null
  return categoryStore.categories.find(cat => cat.id === selectedPrimaryId.value)
})

const selectPrimaryCategory = (categoryId) => {
  selectedPrimaryId.value = categoryId
  selectedSubcategoryId.value = null
  categoryStore.setSelectedCategory(categoryId)
  // 触发事件通知父组件
  emit('category-changed', { categoryId, subcategoryId: null })
}

const selectSubcategory = (subcategoryId) => {
  selectedSubcategoryId.value = subcategoryId
  categoryStore.setSelectedSubcategory(subcategoryId)
  // 触发事件通知父组件
  emit('category-changed', { categoryId: selectedPrimaryId.value, subcategoryId })
}

const emit = defineEmits(['category-changed'])

onMounted(async () => {
  // 获取所有分类
  await categoryStore.fetchCategories()
  // 默认选择第一个分类
  if (categoryStore.categories.length > 0) {
    selectPrimaryCategory(categoryStore.categories[0].id)
  }
})
</script>

<style scoped>
.category-navigation {
  background-color: var(--color-dark-surface);
  border-bottom: 1px solid var(--color-dark-border);
  padding: 0;
}

/* 主分类导航 */
.primary-categories {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--color-dark-border);
}

.primary-categories::-webkit-scrollbar {
  display: none;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: #9ca3af;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  color: var(--color-purple-light);
}

.primary-btn.active {
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
}

.primary-btn .icon {
  font-size: 1.25rem;
}

/* 二级分类导航 */
.secondary-categories {
  background-color: rgba(139, 92, 246, 0.05);
  padding: 0.5rem 1.5rem;
  border-bottom: 1px solid var(--color-dark-border);
  overflow-x: auto;
  scrollbar-width: none;
}

.secondary-categories::-webkit-scrollbar {
  display: none;
}

.secondary-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.secondary-scroll::-webkit-scrollbar {
  display: none;
}

.secondary-btn {
  padding: 0.375rem 0.875rem;
  background-color: var(--color-dark-card);
  color: #9ca3af;
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.8125rem;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  border-color: var(--color-purple-primary);
  color: var(--color-purple-light);
}

.secondary-btn.active {
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
  border-color: var(--color-purple-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .primary-categories {
    padding: 0.5rem 1rem;
  }

  .secondary-categories {
    padding: 0.375rem 1rem;
  }

  .primary-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
  }

  .primary-btn .icon {
    font-size: 1rem;
  }

  .secondary-btn {
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
  }
}
</style>

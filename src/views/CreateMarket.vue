<template>
  <div class="create-market-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <router-link to="/" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回首页
        </router-link>
        <h1 class="page-title">创建预测市场</h1>
        <p class="page-subtitle">创建一个新的预测市场，让用户对未来事件进行预测和交易</p>
      </div>
    </div>

    <!-- 创建表单 -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="create-form">
        <!-- 市场问题 -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="section-icon">❓</span>
            市场问题
          </h2>
          <div class="form-group">
            <label for="question">预测问题 <span class="required">*</span></label>
            <input 
              type="text" 
              id="question" 
              v-model="form.question"
              placeholder="例如：比特币会在2026年底前达到$100,000吗？"
              maxlength="200"
              required
            />
            <div class="input-hint">
              <span>{{ form.question.length }}/200</span>
              <span>问题应该是一个可以用"是"或"否"回答的明确问题</span>
            </div>
          </div>

          <div class="form-group">
            <label for="description">详细描述</label>
            <textarea 
              id="description" 
              v-model="form.description"
              placeholder="提供更多关于这个预测市场的背景信息和判定标准..."
              rows="4"
              maxlength="1000"
            ></textarea>
            <div class="input-hint">
              <span>{{ form.description.length }}/1000</span>
            </div>
          </div>
        </div>

        <!-- 分类选择 -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="section-icon">📁</span>
            市场分类
          </h2>
          <div class="form-row">
            <div class="form-group">
              <label for="primaryCategory">主分类 <span class="required">*</span></label>
              <select 
                id="primaryCategory" 
                v-model="form.primaryCategory"
                @change="handleCategoryChange"
                required
              >
                <option value="">请选择主分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="subcategory">子分类 <span class="required">*</span></label>
              <select 
                id="subcategory" 
                v-model="form.subcategory"
                :disabled="!form.primaryCategory || subcategories.length === 0"
                required
              >
                <option value="">请选择子分类</option>
                <option v-for="sub in subcategories" :key="sub.id" :value="sub.id">
                  {{ sub.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 时间设置 -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="section-icon">⏰</span>
            结束时间
          </h2>
          <div class="form-group">
            <label for="endDate">市场结束日期 <span class="required">*</span></label>
            <input 
              type="date" 
              id="endDate" 
              v-model="form.endDate"
              :min="minDate"
              required
            />
            <div class="input-hint">
              <span>市场将在此日期后停止交易并等待结算</span>
            </div>
          </div>
        </div>

        <!-- 初始概率 -->
        <div class="form-section">
          <h2 class="section-title">
            <span class="section-icon">📊</span>
            初始概率
          </h2>
          <div class="probability-container">
            <div class="probability-slider">
              <div class="prob-labels">
                <span class="prob-yes">YES: {{ Math.round(form.initialYesProb * 100) }}%</span>
                <span class="prob-no">NO: {{ Math.round((1 - form.initialYesProb) * 100) }}%</span>
              </div>
              <input 
                type="range" 
                v-model.number="form.initialYesProb"
                min="0.01"
                max="0.99"
                step="0.01"
                class="slider"
              />
              <div class="prob-bar">
                <div class="prob-yes-bar" :style="{ width: (form.initialYesProb * 100) + '%' }"></div>
                <div class="prob-no-bar" :style="{ width: ((1 - form.initialYesProb) * 100) + '%' }"></div>
              </div>
            </div>
            <div class="input-hint">
              <span>设置市场的初始概率，这将影响初始价格</span>
            </div>
          </div>
        </div>

        <!-- 预览卡片 -->
        <div class="form-section preview-section">
          <h2 class="section-title">
            <span class="section-icon">👁️</span>
            市场预览
          </h2>
          <div class="market-preview-card">
            <div class="preview-header">
              <span class="preview-category">{{ selectedCategoryName }}</span>
              <span class="preview-status">待审核</span>
            </div>
            <h3 class="preview-question">{{ form.question || '您的预测问题将显示在这里' }}</h3>
            <p class="preview-description">{{ form.description || '市场描述...' }}</p>
            <div class="preview-footer">
              <div class="preview-prob">
                <div class="prob-item yes">
                  <span class="prob-label">YES</span>
                  <span class="prob-value">{{ Math.round(form.initialYesProb * 100) }}%</span>
                </div>
                <div class="prob-item no">
                  <span class="prob-label">NO</span>
                  <span class="prob-value">{{ Math.round((1 - form.initialYesProb) * 100) }}%</span>
                </div>
              </div>
              <div class="preview-date">
                结束: {{ form.endDate || '未设置' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="resetForm">
            重置表单
          </button>
          <button type="submit" class="btn-primary" :disabled="isSubmitting || !isFormValid">
            <span v-if="isSubmitting" class="loading-spinner"></span>
            {{ isSubmitting ? '提交中...' : '提交审核' }}
          </button>
        </div>

        <!-- 提示信息 -->
        <div class="form-notice">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>提交后，您的市场将进入审核队列。审核通过后，市场将自动上线并开放交易。</span>
        </div>
      </form>
    </div>

    <!-- 成功弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content success-modal" @click.stop>
        <div class="modal-icon success">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h3>提交成功！</h3>
        <p>您的预测市场已提交审核，审核通过后将自动上线。</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="goToMyMarkets">查看我的市场</button>
          <button class="btn-primary" @click="createAnother">继续创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWalletStore } from '../stores/wallet'
import { useCategoryStore } from '../stores/category'

const router = useRouter()
const walletStore = useWalletStore()
const categoryStore = useCategoryStore()

// 表单数据
const form = ref({
  question: '',
  description: '',
  primaryCategory: '',
  subcategory: '',
  endDate: '',
  initialYesProb: 0.5
})

// 状态
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const categories = ref([])
const subcategories = ref([])

// 计算最小日期（明天）
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// 计算表单是否有效
const isFormValid = computed(() => {
  return form.value.question.length >= 10 &&
         form.value.primaryCategory &&
         form.value.subcategory &&
         form.value.endDate
})

// 获取选中的分类名称
const selectedCategoryName = computed(() => {
  if (!form.value.primaryCategory) return '未选择分类'
  const cat = categories.value.find(c => c.id === form.value.primaryCategory)
  if (!cat) return '未选择分类'
  
  if (form.value.subcategory) {
    const sub = subcategories.value.find(s => s.id === form.value.subcategory)
    if (sub) return `${cat.name} / ${sub.name}`
  }
  return cat.name
})

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await fetch('/api/categories')
    const data = await response.json()
    if (data.success) {
      categories.value = data.data
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 处理主分类变化
const handleCategoryChange = async () => {
  form.value.subcategory = ''
  subcategories.value = []
  
  if (form.value.primaryCategory) {
    try {
      const response = await fetch(`/api/categories/${form.value.primaryCategory}/subcategories`)
      const data = await response.json()
      if (data.success) {
        subcategories.value = data.data
      }
    } catch (error) {
      console.error('加载子分类失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  // 检查用户是否已连接钱包
  if (!walletStore.isConnected) {
    alert('请先连接钱包')
    return
  }
  
  isSubmitting.value = true
  
  try {
    const response = await fetch('/api/markets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${walletStore.token}`
      },
      body: JSON.stringify({
        creator: walletStore.address,
        question: form.value.question,
        description: form.value.description,
        primaryCategory: form.value.primaryCategory,
        subcategory: form.value.subcategory,
        endDate: form.value.endDate,
        initialYesProb: form.value.initialYesProb,
        initialNoProb: 1 - form.value.initialYesProb
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      showSuccessModal.value = true
    } else {
      alert(data.message || '提交失败，请重试')
    }
  } catch (error) {
    console.error('提交失败:', error)
    alert('网络错误，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    question: '',
    description: '',
    primaryCategory: '',
    subcategory: '',
    endDate: '',
    initialYesProb: 0.5
  }
  subcategories.value = []
}

// 关闭成功弹窗
const closeSuccessModal = () => {
  showSuccessModal.value = false
}

// 查看我的市场
const goToMyMarkets = () => {
  router.push('/user')
}

// 继续创建
const createAnother = () => {
  resetForm()
  showSuccessModal.value = false
}

// 初始化
onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.create-market-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0a1e 0%, #1a1333 50%, #0f0a1e 100%);
  padding: 2rem;
}

.page-header {
  max-width: 800px;
  margin: 0 auto 2rem;
}

.header-content {
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #a78bfa;
  text-decoration: none;
  margin-bottom: 1rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #c4b5fd;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #9ca3af;
  font-size: 1.1rem;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 1.5rem;
}

.section-icon {
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  color: #d1d5db;
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(17, 12, 34, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 10px;
  color: #e5e7eb;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #6b7280;
}

.form-group select {
  cursor: pointer;
}

.form-group select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hint {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* 概率滑块 */
.probability-container {
  padding: 1rem 0;
}

.probability-slider {
  margin-bottom: 1rem;
}

.prob-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.prob-yes {
  color: #22c55e;
  font-weight: 600;
}

.prob-no {
  color: #ef4444;
  font-weight: 600;
}

.slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #22c55e 0%, #22c55e 50%, #ef4444 50%, #ef4444 100%);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.prob-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.75rem;
}

.prob-yes-bar {
  background: linear-gradient(90deg, #22c55e, #16a34a);
  transition: width 0.2s;
}

.prob-no-bar {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  transition: width 0.2s;
}

/* 预览卡片 */
.preview-section {
  background: rgba(139, 92, 246, 0.08);
}

.market-preview-card {
  background: rgba(17, 12, 34, 0.9);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 1.25rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-category {
  font-size: 0.8rem;
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.15);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.preview-status {
  font-size: 0.75rem;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.preview-question {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.preview-description {
  font-size: 0.9rem;
  color: #9ca3af;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.preview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(139, 92, 246, 0.2);
}

.preview-prob {
  display: flex;
  gap: 1rem;
}

.prob-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.prob-item .prob-label {
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.prob-item.yes .prob-label {
  color: #22c55e;
}

.prob-item.no .prob-label {
  color: #ef4444;
}

.prob-item .prob-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e5e7eb;
}

.preview-date {
  font-size: 0.85rem;
  color: #9ca3af;
}

/* 表单操作 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.875rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.btn-secondary:hover {
  background: rgba(139, 92, 246, 0.1);
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 提示信息 */
.form-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  color: #93c5fd;
  font-size: 0.9rem;
  line-height: 1.5;
}

.form-notice svg {
  flex-shrink: 0;
  margin-top: 2px;
}

/* 成功弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: linear-gradient(135deg, #1a1333 0%, #0f0a1e 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.modal-icon.success {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.modal-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 0.75rem;
}

.modal-content p {
  color: #9ca3af;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-actions .btn-primary,
.modal-actions .btn-secondary {
  padding: 0.75rem 1.5rem;
}
</style>

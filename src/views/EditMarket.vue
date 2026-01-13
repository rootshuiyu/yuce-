<template>
  <div class="edit-market-page">
    <div class="page-header">
      <router-link to="/user" class="back-link">← 返回</router-link>
      <h1>编辑市场</h1>
      <p class="subtitle">修改您的市场信息（仅在审核前可编辑）</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载市场数据中...</p>
    </div>

    <div v-else-if="market" class="edit-form-container">
      <!-- 市场状态提示 -->
      <div v-if="market.status !== 'pending'" class="warning-box">
        <span class="warning-icon">⚠️</span>
        <span class="warning-text">只有待审核的市场才能编辑。当前市场状态：{{ getStatusText(market.status) }}</span>
      </div>

      <!-- 编辑表单 -->
      <form @submit.prevent="handleSubmit" class="edit-form" :disabled="market.status !== 'pending'">
        <!-- 基本信息 -->
        <div class="form-section">
          <h2 class="section-title">基本信息</h2>

          <div class="form-group">
            <label for="question">市场问题 *</label>
            <textarea
              id="question"
              v-model="form.question"
              placeholder="例如：比特币会在2026年底前达到$150,000吗？"
              rows="3"
              maxlength="500"
              required
              :disabled="market.status !== 'pending'"
            ></textarea>
            <div class="char-count">{{ form.question.length }}/500</div>
            <div v-if="errors.question" class="error-message">{{ errors.question }}</div>
          </div>

          <div class="form-group">
            <label for="description">市场描述</label>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="详细描述这个市场的背景和解析标准..."
              rows="4"
              maxlength="1000"
              :disabled="market.status !== 'pending'"
            ></textarea>
            <div class="char-count">{{ form.description.length }}/1000</div>
          </div>
        </div>

        <!-- 分类信息 -->
        <div class="form-section">
          <h2 class="section-title">分类</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="primaryCategory">主分类 *</label>
              <select
                id="primaryCategory"
                v-model="form.primaryCategory"
                required
                @change="handleCategoryChange"
                :disabled="market.status !== 'pending'"
              >
                <option value="">选择主分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <div v-if="errors.primaryCategory" class="error-message">{{ errors.primaryCategory }}</div>
            </div>

            <div class="form-group">
              <label for="subcategory">子分类 *</label>
              <select
                id="subcategory"
                v-model="form.subcategory"
                required
                :disabled="market.status !== 'pending' || subcategories.length === 0"
              >
                <option value="">选择子分类</option>
                <option v-for="subcat in subcategories" :key="subcat.id" :value="subcat.id">
                  {{ subcat.name }}
                </option>
              </select>
              <div v-if="errors.subcategory" class="error-message">{{ errors.subcategory }}</div>
            </div>
          </div>
        </div>

        <!-- 时间和概率 -->
        <div class="form-section">
          <h2 class="section-title">时间和概率</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="endDate">结束时间 *</label>
              <input
                id="endDate"
                v-model="form.endDate"
                type="date"
                required
                :disabled="market.status !== 'pending'"
              />
              <div v-if="errors.endDate" class="error-message">{{ errors.endDate }}</div>
            </div>

            <div class="form-group">
              <label for="endTime">结束时间（可选）</label>
              <input
                id="endTime"
                v-model="form.endTime"
                type="time"
                :disabled="market.status !== 'pending'"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="initialYesProb">初始 YES 概率 (%)</label>
              <div class="prob-input-group">
                <input
                  id="initialYesProb"
                  v-model.number="form.initialYesProb"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  @input="updateNoProbability"
                  :disabled="market.status !== 'pending'"
                />
                <input
                  v-model.number="form.initialYesProb"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  :disabled="market.status !== 'pending'"
                />
              </div>
              <div v-if="errors.initialYesProb" class="error-message">{{ errors.initialYesProb }}</div>
            </div>

            <div class="form-group">
              <label for="initialNoProb">初始 NO 概率 (%)</label>
              <div class="prob-input-group">
                <input
                  id="initialNoProb"
                  v-model.number="form.initialNoProb"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  @input="updateYesProbability"
                  :disabled="market.status !== 'pending'"
                />
                <input
                  v-model.number="form.initialNoProb"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  :disabled="market.status !== 'pending'"
                />
              </div>
              <div v-if="errors.initialNoProb" class="error-message">{{ errors.initialNoProb }}</div>
            </div>
          </div>

          <!-- 概率可视化 -->
          <div class="prob-visualization">
            <div class="prob-bar">
              <div class="prob-yes" :style="{ width: form.initialYesProb + '%' }"></div>
              <div class="prob-no" :style="{ width: form.initialNoProb + '%' }"></div>
            </div>
            <div class="prob-labels">
              <span>YES: {{ form.initialYesProb.toFixed(1) }}%</span>
              <span>NO: {{ form.initialNoProb.toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <!-- 市场预览 -->
        <div class="form-section">
          <h2 class="section-title">市场预览</h2>
          <div class="market-preview">
            <div class="preview-header">
              <h3>{{ form.question || '市场问题' }}</h3>
              <span class="preview-status pending">待审核</span>
            </div>
            <div class="preview-meta">
              <span>分类: {{ getSubcategoryName(form.subcategory) }}</span>
              <span>结束: {{ form.endDate }}</span>
            </div>
            <div class="preview-prob">
              <div class="prob-item">
                <span>YES</span>
                <div class="prob-bar-small">
                  <div class="prob-fill yes" :style="{ width: form.initialYesProb + '%' }"></div>
                </div>
                <span>{{ form.initialYesProb.toFixed(1) }}%</span>
              </div>
              <div class="prob-item">
                <span>NO</span>
                <div class="prob-bar-small">
                  <div class="prob-fill no" :style="{ width: form.initialNoProb + '%' }"></div>
                </div>
                <span>{{ form.initialNoProb.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button
            v-if="market.status === 'pending'"
            type="submit"
            class="btn-save"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">💾 保存修改</span>
            <span v-else>保存中...</span>
          </button>
          <router-link to="/user" class="btn-cancel">取消</router-link>
        </div>

        <!-- 成功消息 -->
        <div v-if="successMessage" class="success-message">
          <span class="success-icon">✓</span>
          <span>{{ successMessage }}</span>
        </div>
      </form>
    </div>

    <div v-else class="error-box">
      <span class="error-icon">❌</span>
      <span class="error-text">市场不存在或加载失败</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWalletStore } from '../stores/wallet'
import { useCategoryStore } from '../stores/category'

const router = useRouter()
const route = useRoute()
const walletStore = useWalletStore()
const categoryStore = useCategoryStore()

const marketId = route.params.id
const loading = ref(true)
const isSubmitting = ref(false)
const successMessage = ref('')
const market = ref(null)
const categories = ref([])
const subcategories = ref([])

const form = ref({
  question: '',
  description: '',
  primaryCategory: '',
  subcategory: '',
  endDate: '',
  endTime: '',
  initialYesProb: 50,
  initialNoProb: 50
})

const errors = ref({})

// 获取子分类名称
const getSubcategoryName = (subcatId) => {
  const subcat = subcategories.value.find(s => s.id === subcatId)
  return subcat?.name || subcatId
}

// 更新 NO 概率
const updateNoProbability = () => {
  form.value.initialNoProb = 100 - form.value.initialYesProb
}

// 更新 YES 概率
const updateYesProbability = () => {
  form.value.initialYesProb = 100 - form.value.initialNoProb
}

// 处理主分类变化
const handleCategoryChange = async () => {
  form.value.subcategory = ''
  subcategories.value = []

  if (form.value.primaryCategory) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/categories/${form.value.primaryCategory}/subcategories`
      )
      const data = await response.json()
      if (data.success) {
        subcategories.value = data.data
      }
    } catch (error) {
      console.error('加载子分类失败:', error)
    }
  }
}

// 验证表单
const validateForm = () => {
  errors.value = {}

  if (form.value.question.length < 10 || form.value.question.length > 500) {
    errors.value.question = '问题长度必须在 10-500 个字符之间'
  }

  if (!form.value.primaryCategory) {
    errors.value.primaryCategory = '请选择主分类'
  }

  if (!form.value.subcategory) {
    errors.value.subcategory = '请选择子分类'
  }

  if (!form.value.endDate) {
    errors.value.endDate = '请选择结束时间'
  } else if (new Date(form.value.endDate) <= new Date()) {
    errors.value.endDate = '结束时间必须在未来'
  }

  const yesProb = form.value.initialYesProb
  const noProb = form.value.initialNoProb

  if (yesProb < 0 || yesProb > 100 || noProb < 0 || noProb > 100) {
    errors.value.initialYesProb = '概率必须在 0-100 之间'
  }

  if (Math.abs(yesProb + noProb - 100) > 0.1) {
    errors.value.initialYesProb = 'YES 和 NO 概率之和必须等于 100%'
  }

  return Object.keys(errors.value).length === 0
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待审核',
    active: '已通过',
    rejected: '已拒绝',
    settled: '已结算'
  }
  return statusMap[status] || status
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return

  if (market.value.status !== 'pending') {
    alert('只有待审核的市场才能编辑')
    return
  }

  isSubmitting.value = true
  successMessage.value = ''

  try {
    const response = await fetch(`http://localhost:3000/api/markets/${marketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${walletStore.token}`
      },
      body: JSON.stringify({
        question: form.value.question,
        description: form.value.description,
        primaryCategory: form.value.primaryCategory,
        subcategory: form.value.subcategory,
        endDate: form.value.endDate,
        initialYesProb: form.value.initialYesProb / 100,
        initialNoProb: form.value.initialNoProb / 100
      })
    })

    const data = await response.json()

    if (data.success) {
      successMessage.value = '市场信息已保存！'
      setTimeout(() => {
        router.push('/user')
      }, 2000)
    } else {
      alert('保存失败：' + (data.message || '未知错误'))
    }
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 加载市场数据
const fetchMarket = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/markets/${marketId}`)
    const data = await response.json()

    if (data.success) {
      market.value = data.data
      form.value = {
        question: market.value.question,
        description: market.value.description || '',
        primaryCategory: market.value.primaryCategory,
        subcategory: market.value.subcategory,
        endDate: market.value.endDate,
        endTime: '',
        initialYesProb: market.value.initialYesProb * 100,
        initialNoProb: market.value.initialNoProb * 100
      }

      // 加载子分类
      if (market.value.primaryCategory) {
        await handleCategoryChange()
      }
    } else {
      market.value = null
    }
  } catch (error) {
    console.error('加载市场失败:', error)
    market.value = null
  } finally {
    loading.value = false
  }
}

// 加载分类
const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/categories')
    const data = await response.json()
    if (data.success) {
      categories.value = data.data
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

onMounted(() => {
  fetchCategories()
  fetchMarket()
})
</script>

<style scoped>
.edit-market-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.back-link {
  color: #a78bfa;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1rem;
  display: inline-block;
  transition: color 0.2s;
}

.back-link:hover {
  color: #c4b5fd;
}

.page-header h1 {
  font-size: 2rem;
  color: #a78bfa;
  margin: 0.5rem 0 0 0;
}

.subtitle {
  color: #9ca3af;
  margin: 0.5rem 0 0 0;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(139, 92, 246, 0.2);
  border-top-color: #8b5cf6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.warning-box,
.error-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  margin-bottom: 2rem;
  color: #fcd34d;
}

.error-box {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.warning-icon,
.error-icon {
  font-size: 1.5rem;
}

.edit-form-container {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.edit-form[disabled] {
  opacity: 0.6;
  pointer-events: none;
}

.form-section {
  padding: 1.5rem;
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
}

.section-title {
  font-size: 1.125rem;
  color: #a78bfa;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #e5e7eb;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  background: rgba(17, 12, 34, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  color: #e5e7eb;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.form-group input:disabled,
.form-group textarea:disabled,
.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.char-count {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

.error-message {
  color: #fca5a5;
  font-size: 0.75rem;
}

.prob-input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.prob-input-group input[type="range"] {
  flex: 1;
  padding: 0;
  height: 6px;
  cursor: pointer;
}

.prob-input-group input[type="number"] {
  width: 80px;
}

.prob-visualization {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.prob-bar {
  display: flex;
  height: 16px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.prob-yes {
  background: linear-gradient(90deg, #22c55e, #16a34a);
  transition: width 0.2s;
}

.prob-no {
  background: linear-gradient(90deg, #ef4444, #dc2626);
  transition: width 0.2s;
}

.prob-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #d1d5db;
}

.market-preview {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 8px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.preview-header h3 {
  color: #e5e7eb;
  margin: 0;
  line-height: 1.4;
}

.preview-status {
  padding: 0.375rem 0.875rem;
  background: rgba(251, 191, 36, 0.15);
  color: #fcd34d;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.preview-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.preview-prob {
  display: flex;
  gap: 2rem;
}

.prob-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  font-size: 0.875rem;
}

.prob-bar-small {
  flex: 1;
  height: 6px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.prob-fill {
  height: 100%;
  transition: width 0.2s;
}

.prob-fill.yes {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.prob-fill.no {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-save,
.btn-cancel {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-save {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: transparent;
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.btn-cancel:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: #86efac;
  font-weight: 500;
}

.success-icon {
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
  }
}
</style>

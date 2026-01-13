<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <!-- 头部 -->
      <div class="modal-header">
        <h2>创建新市场</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <!-- 表单 -->
      <form @submit.prevent="submitForm" class="market-form">
        <!-- 问题 -->
        <div class="form-group">
          <label for="question">问题 *</label>
          <input
            id="question"
            v-model="form.question"
            type="text"
            placeholder="输入市场问题，例如：比特币会在2024年达到$100,000吗？"
            maxlength="500"
            required
          />
          <div class="char-count">{{ form.question.length }}/500</div>
          <div v-if="errors.question" class="error-message">{{ errors.question }}</div>
        </div>

        <!-- 描述 -->
        <div class="form-group">
          <label for="description">描述</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="添加更多背景信息（可选）"
            rows="3"
            maxlength="1000"
          ></textarea>
          <div class="char-count">{{ form.description.length }}/1000</div>
        </div>

        <!-- 分类选择 -->
        <div class="form-row">
          <div class="form-group">
            <label for="primaryCategory">一级分类 *</label>
            <select
              id="primaryCategory"
              v-model="form.primaryCategory"
              @change="updateSubcategories"
              required
            >
              <option value="">选择分类</option>
              <option v-for="cat in primaryCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <div v-if="errors.primaryCategory" class="error-message">{{ errors.primaryCategory }}</div>
          </div>

          <div class="form-group">
            <label for="subcategory">二级分类 *</label>
            <select
              id="subcategory"
              v-model="form.subcategory"
              required
            >
              <option value="">选择子分类</option>
              <option v-for="subcat in subcategories" :key="subcat.id" :value="subcat.id">
                {{ subcat.name }}
              </option>
            </select>
            <div v-if="errors.subcategory" class="error-message">{{ errors.subcategory }}</div>
          </div>
        </div>

        <!-- 结束时间 -->
        <div class="form-group">
          <label for="endDate">结束时间 *</label>
          <input
            id="endDate"
            v-model="form.endDate"
            type="date"
            required
          />
          <div v-if="errors.endDate" class="error-message">{{ errors.endDate }}</div>
        </div>

        <!-- 初始概率 -->
        <div class="form-group">
          <label>初始概率</label>
          <div class="probability-inputs">
            <div class="prob-input">
              <label for="yesProb">YES概率</label>
              <div class="prob-control">
                <input
                  id="yesProb"
                  v-model.number="form.initialYesProb"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  @input="updateNoProb"
                />
                <span class="prob-value">{{ (form.initialYesProb * 100).toFixed(0) }}%</span>
              </div>
            </div>

            <div class="prob-input">
              <label for="noProb">NO概率</label>
              <div class="prob-control">
                <input
                  id="noProb"
                  v-model.number="form.initialNoProb"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  disabled
                />
                <span class="prob-value">{{ (form.initialNoProb * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 按钮 -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            取消
          </button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner"></span>
            <span v-else>创建市场</span>
          </button>
        </div>
      </form>

      <!-- 成功消息 -->
      <div v-if="successMessage" class="success-message">
        <span>✓ {{ successMessage }}</span>
      </div>

      <!-- 错误消息 -->
      <div v-if="submitError" class="submit-error">
        <span>✕ {{ submitError }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWalletStore } from '../stores/wallet'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const walletStore = useWalletStore()

// 表单数据
const form = ref({
  question: '',
  description: '',
  primaryCategory: '',
  subcategory: '',
  endDate: '',
  initialYesProb: 0.5,
  initialNoProb: 0.5
})

// 分类数据
const primaryCategories = ref([])
const subcategories = ref([])

// 状态
const errors = ref({})
const isSubmitting = ref(false)
const successMessage = ref('')
const submitError = ref('')

// 获取分类数据
onMounted(async () => {
  try {
    const response = await fetch('/api/categories/primary')
    const data = await response.json()
    primaryCategories.value = data.data || []
  } catch (error) {
    console.error('获取分类失败:', error)
  }
})

// 更新二级分类
const updateSubcategories = async () => {
  try {
    const response = await fetch(`/api/categories/${form.value.primaryCategory}/subcategories`)
    const data = await response.json()
    subcategories.value = data.data || []
    form.value.subcategory = '' // 重置子分类选择
  } catch (error) {
    console.error('获取子分类失败:', error)
  }
}

// 更新NO概率
const updateNoProb = () => {
  form.value.initialNoProb = Math.max(0, Math.min(1, 1 - form.value.initialYesProb))
}

// 验证表单
const validateForm = () => {
  errors.value = {}

  if (!form.value.question || form.value.question.length < 10) {
    errors.value.question = '问题长度必须至少10个字符'
  }

  if (!form.value.primaryCategory) {
    errors.value.primaryCategory = '请选择一级分类'
  }

  if (!form.value.subcategory) {
    errors.value.subcategory = '请选择二级分类'
  }

  if (!form.value.endDate) {
    errors.value.endDate = '请选择结束时间'
  } else {
    const endDate = new Date(form.value.endDate)
    if (endDate <= new Date()) {
      errors.value.endDate = '结束时间必须在未来'
    }
  }

  return Object.keys(errors.value).length === 0
}

// 提交表单
const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  if (!walletStore.isConnected) {
    submitError.value = '请先连接钱包'
    return
  }

  try {
    isSubmitting.value = true
    submitError.value = ''
    successMessage.value = ''

    const response = await fetch('/api/markets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        creator: walletStore.account,
        question: form.value.question,
        description: form.value.description,
        primaryCategory: form.value.primaryCategory,
        subcategory: form.value.subcategory,
        endDate: form.value.endDate,
        initialYesProb: form.value.initialYesProb,
        initialNoProb: form.value.initialNoProb
      })
    })

    const data = await response.json()

    if (data.success) {
      successMessage.value = data.message
      emit('success', data.market)

      // 2秒后关闭模态框
      setTimeout(() => {
        closeModal()
      }, 2000)
    } else {
      submitError.value = data.message || '创建市场失败'
    }
  } catch (error) {
    console.error('创建市场错误:', error)
    submitError.value = error.message || '创建市场失败'
  } finally {
    isSubmitting.value = false
  }
}

// 关闭模态框
const closeModal = () => {
  // 重置表单
  form.value = {
    question: '',
    description: '',
    primaryCategory: '',
    subcategory: '',
    endDate: '',
    initialYesProb: 0.5,
    initialNoProb: 0.5
  }
  errors.value = {}
  successMessage.value = ''
  submitError.value = ''
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: var(--color-dark-card);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.5rem;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-dark-border);
  padding-bottom: 1rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: var(--color-purple-light);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: var(--color-purple-light);
}

.market-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  background-color: var(--color-dark-bg);
  border: 1px solid var(--color-dark-border);
  border-radius: 0.375rem;
  color: #e5e7eb;
  padding: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-purple-primary);
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.char-count {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.probability-inputs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prob-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prob-input label {
  color: #e5e7eb;
  font-weight: 500;
  font-size: 0.875rem;
}

.prob-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.prob-control input {
  flex: 1;
}

.prob-value {
  color: var(--color-purple-light);
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

.error-message {
  color: #fca5a5;
  font-size: 0.75rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background-color: var(--color-dark-bg);
  color: #e5e7eb;
  border: 1px solid var(--color-dark-border);
}

.btn-cancel:hover {
  border-color: #9ca3af;
  color: #f3f4f6;
}

.btn-submit {
  background-color: var(--color-purple-primary);
  color: var(--color-dark-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--color-purple-light);
  transform: translateY(-2px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #9ca3af;
  border-top-color: var(--color-dark-bg);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.375rem;
  color: #86efac;
  font-size: 0.875rem;
  text-align: center;
}

.submit-error {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.375rem;
  color: #fca5a5;
  font-size: 0.875rem;
  text-align: center;
}
</style>

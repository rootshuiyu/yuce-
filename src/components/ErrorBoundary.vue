<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>出错了</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="resetError" class="btn-primary">
          重新加载
        </button>
        <button @click="goHome" class="btn-secondary">
          返回首页
        </button>
      </div>
      <details v-if="isDev" class="error-details">
        <summary>错误详情</summary>
        <pre>{{ errorStack }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')
const isDev = import.meta.env.DEV

const resetError = () => {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
}

const goHome = () => {
  resetError()
  router.push('/')
}

// 捕获错误
const captureError = (error) => {
  hasError.value = true
  errorMessage.value = error.message || '发生未知错误'
  errorStack.value = error.stack || ''
  console.error('Error caught by boundary:', error)
}

defineExpose({
  captureError
})
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0a1a 0%, #1a1428 100%);
}

.error-container {
  background: #2a1f3d;
  border: 1px solid #3d2f52;
  border-radius: 1rem;
  padding: 3rem 2rem;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h2 {
  color: #e5e7eb;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #9ca3af;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #a78bfa;
  color: #0f0a1a;
}

.btn-primary:hover {
  background: #c4b5fd;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #3d2f52;
  color: #e5e7eb;
  border: 1px solid #a78bfa;
}

.btn-secondary:hover {
  background: #4a3a63;
}

.error-details {
  text-align: left;
  background: #1a1428;
  border: 1px solid #3d2f52;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.error-details summary {
  cursor: pointer;
  color: #a78bfa;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-details pre {
  color: #9ca3af;
  font-size: 0.75rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

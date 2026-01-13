<template>
  <transition name="fade">
    <div v-if="isVisible" :class="['error-alert', `alert-${type}`]">
      <div class="alert-content">
        <div class="alert-icon">
          <span v-if="type === 'error'">⚠️</span>
          <span v-else-if="type === 'success'">✅</span>
          <span v-else-if="type === 'warning'">⚡</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="alert-text">
          <p class="alert-title">{{ title }}</p>
          <p v-if="message" class="alert-message">{{ message }}</p>
        </div>
        <button class="alert-close" @click="close">×</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'success', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: '提示'
  },
  message: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['close'])

const isVisible = ref(props.isVisible)

watch(() => props.isVisible, (newVal) => {
  isVisible.value = newVal
  if (newVal && props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})

const close = () => {
  isVisible.value = false
  emit('close')
}
</script>

<style scoped>
.error-alert {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 999;
  animation: slideIn 0.3s ease-out;
}

.alert-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.alert-text {
  flex: 1;
  min-width: 0;
}

.alert-title {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
}

.alert-message {
  margin: 4px 0 0 0;
  font-size: 13px;
  opacity: 0.8;
}

.alert-close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-close:hover {
  opacity: 1;
}

/* 类型样式 */
.alert-error {
  background-color: #fee;
  border-left: 4px solid #f44336;
  color: #c62828;
}

.alert-success {
  background-color: #efe;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
}

.alert-warning {
  background-color: #fef3e0;
  border-left: 4px solid #ff9800;
  color: #e65100;
}

.alert-info {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  color: #1565c0;
}

/* 动画 */
@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(400px);
}
</style>

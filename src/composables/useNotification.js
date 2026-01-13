import { ref, reactive } from 'vue'

// 全局通知状态
const notifications = reactive([])

export function useNotification() {
  const showNotification = (options) => {
    const {
      type = 'info',
      title = '提示',
      message = '',
      duration = 5000,
      id = Date.now()
    } = options

    const notification = {
      id,
      type,
      title,
      message,
      isVisible: true
    }

    notifications.push(notification)

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const removeNotification = (id) => {
    const index = notifications.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.splice(index, 1)
    }
  }

  const success = (title, message = '', duration = 3000) => {
    return showNotification({
      type: 'success',
      title,
      message,
      duration
    })
  }

  const error = (title, message = '', duration = 5000) => {
    return showNotification({
      type: 'error',
      title,
      message,
      duration
    })
  }

  const warning = (title, message = '', duration = 4000) => {
    return showNotification({
      type: 'warning',
      title,
      message,
      duration
    })
  }

  const info = (title, message = '', duration = 3000) => {
    return showNotification({
      type: 'info',
      title,
      message,
      duration
    })
  }

  return {
    notifications,
    showNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  }
}

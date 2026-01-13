import { ref, onMounted, onUnmounted } from 'vue'

export function useRealtime() {
  const ws = ref(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5

  const connect = (url = null) => {
    const wsUrl = url || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`

    try {
      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        console.log('✅ WebSocket 连接成功')
        isConnected.value = true
        reconnectAttempts.value = 0
      }

      ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('📨 收到消息:', data)
        // 触发事件或更新状态
        window.dispatchEvent(new CustomEvent('realtime-update', { detail: data }))
      }

      ws.value.onerror = (error) => {
        console.error('❌ WebSocket 错误:', error)
        isConnected.value = false
      }

      ws.value.onclose = () => {
        console.log('❌ WebSocket 连接关闭')
        isConnected.value = false
        attemptReconnect()
      }
    } catch (error) {
      console.error('❌ WebSocket 连接失败:', error)
      attemptReconnect()
    }
  }

  const attemptReconnect = () => {
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value - 1), 30000)
      console.log(`🔄 ${delay}ms 后重新连接... (尝试 ${reconnectAttempts.value}/${maxReconnectAttempts})`)
      setTimeout(() => connect(), delay)
    }
  }

  const send = (data) => {
    if (isConnected.value && ws.value) {
      ws.value.send(JSON.stringify(data))
    } else {
      console.warn('⚠️ WebSocket 未连接')
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
      isConnected.value = false
    }
  }

  const subscribe = (channel, callback) => {
    const handler = (event) => {
      const data = event.detail
      if (data.channel === channel) {
        callback(data)
      }
    }
    window.addEventListener('realtime-update', handler)
    return () => window.removeEventListener('realtime-update', handler)
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    connect,
    disconnect,
    send,
    subscribe
  }
}

import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';

export const useWebSocketStore = defineStore('websocket', () => {
  const ws = ref(null);
  const isConnected = ref(false);
  const messageHandlers = reactive({});
  const subscriptions = reactive({}); // marketId -> true
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = ref(1000);

  /**
   * 连接到 WebSocket 服务器
   */
  const connect = (userId) => {
    if (isConnected.value) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      ws.value = new WebSocket(wsUrl);

      ws.value.onopen = () => {
        console.log('[WebSocket] 已连接');
        isConnected.value = true;
        reconnectAttempts.value = 0;
        reconnectDelay.value = 1000;

        // 重新订阅所有市场
        Object.keys(subscriptions).forEach(marketId => {
          subscribe(userId, marketId);
        });
      };

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (err) {
          console.error('[WebSocket] 消息解析错误:', err);
        }
      };

      ws.value.onerror = (error) => {
        console.error('[WebSocket] 连接错误:', error);
      };

      ws.value.onclose = () => {
        console.log('[WebSocket] 连接已关闭');
        isConnected.value = false;
        attemptReconnect(userId);
      };
    } catch (err) {
      console.error('[WebSocket] 连接失败:', err);
      attemptReconnect(userId);
    }
  };

  /**
   * 尝试重新连接
   */
  const attemptReconnect = (userId) => {
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++;
      console.log(`[WebSocket] ${reconnectDelay.value}ms 后重新连接 (尝试 ${reconnectAttempts.value}/${maxReconnectAttempts})`);

      setTimeout(() => {
        connect(userId);
      }, reconnectDelay.value);

      // 指数退避
      reconnectDelay.value = Math.min(reconnectDelay.value * 2, 30000);
    } else {
      console.error('[WebSocket] 重新连接失败，已达到最大尝试次数');
    }
  };

  /**
   * 处理接收到的消息
   */
  const handleMessage = (data) => {
    const { type } = data;

    console.log(`[WebSocket] 收到消息: ${type}`);

    // 调用注册的处理器
    if (messageHandlers[type]) {
      messageHandlers[type].forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[WebSocket] 消息处理器错误 (${type}):`, err);
        }
      });
    }
  };

  /**
   * 订阅市场
   */
  const subscribe = (userId, marketId) => {
    if (!isConnected.value || !ws.value) {
      console.warn('[WebSocket] 未连接，无法订阅');
      subscriptions[marketId] = true; // 记录订阅意图
      return;
    }

    const message = JSON.stringify({
      type: 'subscribe',
      userId,
      marketId
    });

    ws.value.send(message);
    subscriptions[marketId] = true;
  };

  /**
   * 取消订阅市场
   */
  const unsubscribe = (userId, marketId) => {
    if (!isConnected.value || !ws.value) {
      console.warn('[WebSocket] 未连接，无法取消订阅');
      return;
    }

    const message = JSON.stringify({
      type: 'unsubscribe',
      userId,
      marketId
    });

    ws.value.send(message);
    delete subscriptions[marketId];
  };

  /**
   * 注册消息处理器
   */
  const onMessage = (type, handler) => {
    if (!messageHandlers[type]) {
      messageHandlers[type] = [];
    }
    messageHandlers[type].push(handler);

    // 返回取消注册函数
    return () => {
      const index = messageHandlers[type].indexOf(handler);
      if (index > -1) {
        messageHandlers[type].splice(index, 1);
      }
    };
  };

  /**
   * 发送 ping 保活
   */
  const ping = () => {
    if (isConnected.value && ws.value) {
      ws.value.send(JSON.stringify({ type: 'ping' }));
    }
  };

  /**
   * 断开连接
   */
  const disconnect = () => {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
    isConnected.value = false;
    subscriptions.value = {};
  };

  return {
    ws,
    isConnected,
    subscriptions,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    onMessage,
    ping
  };
});

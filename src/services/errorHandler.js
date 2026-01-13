// 错误处理和日志服务
const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || 'info'

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel = LOG_LEVELS[LOG_LEVEL] || LOG_LEVELS.info

const log = (level, message, data = null) => {
  if (LOG_LEVELS[level] < currentLevel) return

  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`

  if (data) {
    console.log(`${prefix} ${message}`, data)
  } else {
    console.log(`${prefix} ${message}`)
  }

  // 生产环境错误上报
  if (level === 'error' && import.meta.env.PROD) {
    reportError(message, data)
  }
}

const reportError = (message, data) => {
  // 可以集成到错误追踪服务如 Sentry
  console.error('Error reported:', { message, data })
}

export const logger = {
  debug: (msg, data) => log('debug', msg, data),
  info: (msg, data) => log('info', msg, data),
  warn: (msg, data) => log('warn', msg, data),
  error: (msg, data) => log('error', msg, data),
}

// 全局错误处理
export const setupErrorHandler = (app) => {
  app.config.errorHandler = (err, instance, info) => {
    logger.error(`Vue Error: ${info}`, {
      message: err.message,
      stack: err.stack,
    })
  }

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', {
      reason: event.reason,
    })
  })

  window.addEventListener('error', (event) => {
    logger.error('Global Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
    })
  })
}

export default logger

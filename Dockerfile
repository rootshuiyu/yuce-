# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 安装生产依赖
RUN npm install -g http-proxy express compression

# 复制构建输出
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/proxy-server.mjs ./proxy-server.mjs
COPY --from=builder /app/package.json ./package.json

# 安装代理服务器依赖
RUN npm ci --only=production

# 暴露端口
EXPOSE 8081

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8081/ || exit 1

# 启动代理服务器
CMD ["node", "proxy-server.mjs"]

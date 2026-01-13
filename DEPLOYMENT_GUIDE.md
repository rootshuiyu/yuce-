# 云服务器部署指南

## 快速开始

### 1. 克隆代码仓库
```bash
git clone <repository-url>
cd yuce-frontend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 构建前端
```bash
npm run build
```

### 4. 启动服务
```bash
# 启动代理服务器（同时提供前端和 API 转发）
node proxy-server.mjs
```

应用将在 `http://localhost:8081` 运行

---

## 详细部署步骤

### 步骤 1: 环境准备

#### 系统要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- 后端服务运行在 `localhost:3000`
- 数据库已配置并可访问

#### 安装 Node.js（如果需要）
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 步骤 2: 部署前端

```bash
# 克隆仓库
git clone <repository-url>
cd yuce-frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 验证构建
ls -la dist/
```

### 步骤 3: 配置代理服务器

代理服务器配置文件：`proxy-server.mjs`

**关键配置**:
```javascript
const BACKEND_URL = 'http://localhost:3000'  // 后端服务地址
const PROXY_PORT = 8081                      // 代理服务器端口
const DIST_DIR = './dist'                    // 前端文件目录
```

如需修改，编辑 `proxy-server.mjs` 文件中的这些常量。

### 步骤 4: 启动服务

```bash
# 方式 1: 直接运行
node proxy-server.mjs

# 方式 2: 使用 PM2（推荐用于生产环境）
npm install -g pm2
pm2 start proxy-server.mjs --name "yuce-frontend"
pm2 save
pm2 startup

# 查看日志
pm2 logs yuce-frontend
```

### 步骤 5: 配置反向代理（可选）

如果需要在特定域名或端口上运行，使用 Nginx 反向代理：

```nginx
# /etc/nginx/sites-available/yuce-frontend
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/yuce-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 步骤 6: 配置 HTTPS（推荐）

使用 Let's Encrypt 配置 HTTPS：

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 环境变量配置

### 后端连接配置

确保后端服务正在运行，并且可以从前端代理服务器访问：

```bash
# 测试后端连接
curl http://localhost:3000/api/markets

# 如果返回 JSON 数据，说明连接正常
```

### 前端配置

前端应用使用相对 URL `/api`，代理服务器自动转发到后端。

无需额外配置环境变量。

---

## 监控和维护

### 查看日志

```bash
# 如果使用 PM2
pm2 logs yuce-frontend

# 如果直接运行，查看终端输出
```

### 重启服务

```bash
# 如果使用 PM2
pm2 restart yuce-frontend

# 如果直接运行，按 Ctrl+C 停止，然后重新运行
node proxy-server.mjs
```

### 更新代码

```bash
# 拉取最新代码
git pull origin main

# 重新构建
npm run build

# 重启服务
pm2 restart yuce-frontend
```

---

## 故障排查

### 问题 1: 端口被占用

```bash
# 查看占用端口 8081 的进程
lsof -i :8081

# 杀死进程
kill -9 <PID>
```

### 问题 2: 后端连接失败

```bash
# 检查后端是否运行
curl http://localhost:3000/api/markets

# 如果失败，检查后端日志
# 确保后端服务已启动
```

### 问题 3: 前端资源加载失败

```bash
# 检查 dist 目录是否存在
ls -la dist/

# 如果不存在，重新构建
npm run build

# 检查文件权限
chmod -R 755 dist/
```

### 问题 4: 高内存占用

```bash
# 检查进程内存使用
ps aux | grep node

# 如果使用 PM2，查看详细信息
pm2 monit
```

---

## 性能优化

### 1. 启用 Gzip 压缩

在 `proxy-server.mjs` 中添加：

```javascript
import compression from 'compression'
app.use(compression())
```

安装依赖：
```bash
npm install compression
```

### 2. 设置缓存头

```javascript
app.use(express.static('./dist', {
  maxAge: '1d',  // 1 天缓存
  etag: false
}))
```

### 3. 使用 CDN

将 `dist/` 目录中的静态资源上传到 CDN，修改 `index.html` 中的资源路径。

---

## 安全建议

1. **更新依赖**
   ```bash
   npm audit
   npm audit fix
   ```

2. **限制请求速率**
   ```bash
   npm install express-rate-limit
   ```

3. **设置安全头**
   ```bash
   npm install helmet
   ```

4. **启用 HTTPS**
   - 使用 Let's Encrypt 获取免费证书
   - 在 Nginx 中配置 SSL

5. **定期备份**
   - 备份代码仓库
   - 备份数据库

---

## 扩展和集成

### 1. 添加自定义域名

在 Nginx 配置中修改 `server_name`：

```nginx
server_name your-domain.com www.your-domain.com;
```

### 2. 配置多个实例（负载均衡）

```nginx
upstream yuce_backend {
    server localhost:8081;
    server localhost:8082;
    server localhost:8083;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://yuce_backend;
    }
}
```

### 3. 集成 Docker

创建 `Dockerfile`：

```dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8081

CMD ["node", "proxy-server.mjs"]
```

构建和运行：

```bash
docker build -t yuce-frontend .
docker run -p 8081:8081 yuce-frontend
```

---

## 常用命令速查表

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run build` | 构建生产版本 |
| `npm run dev` | 启动开发服务器（仅用于开发） |
| `node proxy-server.mjs` | 启动代理服务器 |
| `pm2 start proxy-server.mjs` | 使用 PM2 启动 |
| `pm2 logs` | 查看日志 |
| `pm2 restart all` | 重启所有服务 |
| `pm2 stop all` | 停止所有服务 |

---

## 支持和反馈

如有问题，请：

1. 检查日志文件
2. 验证后端连接
3. 确认环境配置
4. 查看故障排查部分

---

**最后更新**: 2026-01-13  
**版本**: 1.0.0

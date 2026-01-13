# 快速开始指南

## 本地开发

### 1. 启动后端服务
```bash
# 在后端项目目录中
npm start
# 后端服务将在 http://localhost:3000 运行
```

### 2. 启动前端代理服务器
```bash
# 在 yuce-frontend 目录中
npm install
node proxy-server.mjs
# 前端应用将在 http://localhost:8081 运行
```

### 3. 访问应用
打开浏览器访问: http://localhost:8081

---

## 云服务器部署

### 1. 克隆代码
```bash
git clone <repository-url>
cd yuce-frontend
```

### 2. 安装和构建
```bash
npm install
npm run build
```

### 3. 启动服务
```bash
node proxy-server.mjs
```

### 4. 配置 Nginx（可选）
```bash
# 参考 DEPLOYMENT_GUIDE.md 中的 Nginx 配置
```

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `INTEGRATION_SUMMARY.md` | 前后端集成总结 |
| `DEPLOYMENT_GUIDE.md` | 详细部署指南 |
| `proxy-server.mjs` | API 代理服务器 |
| `src/stores/market.js` | 市场数据管理（已优化） |
| `src/main.js` | 应用入口（已优化） |
| `dist/` | 生产构建输出 |

---

## 关键修改

### ✅ 已完成
- 前后端 API 集成
- 应用初始化优化
- 代理服务器配置
- 生产构建完成
- 部署文档编写

### 📝 API 端点
- `GET /api/markets` - 获取市场列表
- `GET /api/markets/{id}` - 获取市场详情
- `POST /api/markets` - 创建市场
- 其他端点详见后端文档

---

## 常见问题

**Q: 前端应用无法加载数据？**  
A: 确保后端服务运行在 `localhost:3000`，并且代理服务器正确转发请求。

**Q: 如何修改 API 地址？**  
A: 编辑 `proxy-server.mjs` 中的 `BACKEND_URL` 常量。

**Q: 如何在生产环境运行？**  
A: 参考 `DEPLOYMENT_GUIDE.md` 中的详细步骤。

---

## 下一步

1. 部署到云服务器
2. 配置数据库连接
3. 完善前端功能
4. 实现用户认证
5. 添加交易功能

---

**版本**: 1.0.0  
**最后更新**: 2026-01-13

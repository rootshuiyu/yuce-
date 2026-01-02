# 数据库设置和测试数据生成指南

## 快速开始

### 1. 确保 MongoDB 运行

**本地 MongoDB:**
```bash
# Windows
net start MongoDB

# 或使用 MongoDB Compass 连接
# 连接字符串: mongodb://localhost:27017
```

**MongoDB Atlas (云端):**
- 在 MongoDB Compass 中配置连接字符串
- 或设置 `MONGODB_URI` 环境变量

### 2. 配置环境变量

在 `backend/.env` 文件中设置：

```env
MONGODB_URI=mongodb://localhost:27017/prediction-market
# 或使用 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prediction-market
```

### 3. 生成测试数据

**方式一：使用更新后的脚本（推荐）**
```bash
cd backend
npm run generate-test-data-updated
```

**方式二：清空并重新生成**
```bash
cd backend
npm run generate-test-data-updated -- --clear
```

**方式三：通过 API 生成（需要后端服务运行）**
```bash
# 先启动后端服务
cd backend
npm start

# 在另一个终端
cd backend
npm run generate-test-data-api
```

**方式四：直接调用 API**
```bash
# 启动后端服务后
curl -X POST http://localhost:3001/api/markets/generate-test-data \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'
```

### 4. 验证数据

**在 MongoDB Compass 中:**
1. 连接到数据库
2. 选择 `prediction-market` 数据库
3. 查看 `markets` 集合
4. 应该能看到生成的测试市场数据

**通过 API:**
```bash
# 获取所有市场
curl http://localhost:3001/api/markets

# 获取特定市场
curl http://localhost:3001/api/markets/1
```

**在前端:**
- 访问 http://localhost:3004
- 应该能看到市场列表

## 数据模型说明

### Market 集合字段

- `marketId` (Number) - 市场ID，唯一
- `question` (String) - 市场问题
- `options` (Array) - 选项数组
  - `id` (Number) - 选项ID (0=No, 1=Yes)
  - `name` (String) - 选项名称
  - `totalShares` (Number) - 总持仓数
  - `totalCost` (Number) - 总成本
- `marketType` (String) - 市场类型: `cryptoHardFact`, `cryptoEvent`, `sports`
- `status` (String) - 状态: `trading`, `closed`, `proposed`, `challenged`, `finalized`, `invalid`
- `category` (String) - 分类: `politics`, `crypto`, `sports`, `finance`, `tech`, `culture`, `world`, `economy`
- `creator` (String) - 创建者地址
- `closeTime` (Date) - 关闭时间
- `totalVolume` (Number) - 总交易量
- `transactionCount` (Number) - 交易次数
- `createdAt` (Date) - 创建时间

## 常见问题

### 1. 连接失败

**错误:** `MongoServerSelectionError`

**解决方案:**
- 检查 MongoDB 服务是否运行
- 检查连接字符串是否正确
- 如果使用 MongoDB Atlas，检查 IP 白名单

### 2. 数据未显示

**检查:**
- 后端服务是否运行在 http://localhost:3001
- 前端是否正确配置 API URL
- 浏览器控制台是否有错误

### 3. 清空数据

```bash
# 在 MongoDB Compass 中
# 右键 markets 集合 -> Drop Collection

# 或通过 API
curl -X DELETE http://localhost:3001/api/markets/clear-test-data
```

## 下一步

1. ✅ 生成测试数据
2. ✅ 启动后端服务: `cd backend && npm start`
3. ✅ 启动前端服务: `cd frontend && npm run serve`
4. ✅ 访问 http://localhost:3004 查看应用




## 快速开始

### 1. 确保 MongoDB 运行

**本地 MongoDB:**
```bash
# Windows
net start MongoDB

# 或使用 MongoDB Compass 连接
# 连接字符串: mongodb://localhost:27017
```

**MongoDB Atlas (云端):**
- 在 MongoDB Compass 中配置连接字符串
- 或设置 `MONGODB_URI` 环境变量

### 2. 配置环境变量

在 `backend/.env` 文件中设置：

```env
MONGODB_URI=mongodb://localhost:27017/prediction-market
# 或使用 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/prediction-market
```

### 3. 生成测试数据

**方式一：使用更新后的脚本（推荐）**
```bash
cd backend
npm run generate-test-data-updated
```

**方式二：清空并重新生成**
```bash
cd backend
npm run generate-test-data-updated -- --clear
```

**方式三：通过 API 生成（需要后端服务运行）**
```bash
# 先启动后端服务
cd backend
npm start

# 在另一个终端
cd backend
npm run generate-test-data-api
```

**方式四：直接调用 API**
```bash
# 启动后端服务后
curl -X POST http://localhost:3001/api/markets/generate-test-data \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'
```

### 4. 验证数据

**在 MongoDB Compass 中:**
1. 连接到数据库
2. 选择 `prediction-market` 数据库
3. 查看 `markets` 集合
4. 应该能看到生成的测试市场数据

**通过 API:**
```bash
# 获取所有市场
curl http://localhost:3001/api/markets

# 获取特定市场
curl http://localhost:3001/api/markets/1
```

**在前端:**
- 访问 http://localhost:3004
- 应该能看到市场列表

## 数据模型说明

### Market 集合字段

- `marketId` (Number) - 市场ID，唯一
- `question` (String) - 市场问题
- `options` (Array) - 选项数组
  - `id` (Number) - 选项ID (0=No, 1=Yes)
  - `name` (String) - 选项名称
  - `totalShares` (Number) - 总持仓数
  - `totalCost` (Number) - 总成本
- `marketType` (String) - 市场类型: `cryptoHardFact`, `cryptoEvent`, `sports`
- `status` (String) - 状态: `trading`, `closed`, `proposed`, `challenged`, `finalized`, `invalid`
- `category` (String) - 分类: `politics`, `crypto`, `sports`, `finance`, `tech`, `culture`, `world`, `economy`
- `creator` (String) - 创建者地址
- `closeTime` (Date) - 关闭时间
- `totalVolume` (Number) - 总交易量
- `transactionCount` (Number) - 交易次数
- `createdAt` (Date) - 创建时间

## 常见问题

### 1. 连接失败

**错误:** `MongoServerSelectionError`

**解决方案:**
- 检查 MongoDB 服务是否运行
- 检查连接字符串是否正确
- 如果使用 MongoDB Atlas，检查 IP 白名单

### 2. 数据未显示

**检查:**
- 后端服务是否运行在 http://localhost:3001
- 前端是否正确配置 API URL
- 浏览器控制台是否有错误

### 3. 清空数据

```bash
# 在 MongoDB Compass 中
# 右键 markets 集合 -> Drop Collection

# 或通过 API
curl -X DELETE http://localhost:3001/api/markets/clear-test-data
```

## 下一步

1. ✅ 生成测试数据
2. ✅ 启动后端服务: `cd backend && npm start`
3. ✅ 启动前端服务: `cd frontend && npm run serve`
4. ✅ 访问 http://localhost:3004 查看应用




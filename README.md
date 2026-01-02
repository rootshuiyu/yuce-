# 预测市场平台 (Prediction Market Platform)

一个去中心化的预测市场平台，类似 Polymarket，允许用户创建和交易预测市场。

## 项目结构

```
yuce/
├── contracts/          # 智能合约 (Solidity)
├── backend/           # 后端服务 (Node.js + Express)
└── docs/              # 文档
```

## 功能特性

- ✅ 创建预测市场
- ✅ 买卖预测选项
- ✅ 自动定价机制
- ✅ 流动性池支持
- ✅ 去中心化结果验证
- ✅ 用户排行榜
- ✅ 实时市场数据

## 技术栈

### 智能合约
- Solidity ^0.8.0
- Hardhat
- OpenZeppelin

### 后端
- Node.js
- Express.js
- MongoDB
- Web3.js / Ethers.js


## 快速开始

### 1. 安装依赖

```bash
npm install
cd backend && npm install
cd ../contracts && npm install
```

### 2. 配置环境变量

#### 后端 (.env)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/prediction-market
PRIVATE_KEY=your_private_key
RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=your_contract_address
```

### 3. 编译和部署智能合约

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network polygon
```

### 4. 启动服务

```bash
# 启动后端
npm run server
```

## 智能合约说明

### 核心合约

1. **MarketFactory.sol** - 市场工厂合约（创建新市场）
2. **Market.sol** - 单个市场合约（ERC1155，支持 YES/NO 持仓）
3. **Settlement.sol** - 结算合约（CLOB 订单匹配和链上结算）
4. **MarketToken.sol** - ERC20代币合约（旧版，已废弃）
5. **Oracle.sol** - 预言机合约（结果验证）

### 主要功能

- `createMarket()` - 创建新市场（通过 MarketFactory）
- `mintPosition()` - 铸造持仓（YES/NO）
- `redeemPosition()` - 赎回持仓
- `proposeOutcome()` - Oracle 提议结果
- `challengeOutcome()` - 挑战提议
- `finalizeMarket()` - 最终化市场

## API 文档

### 市场相关

- `GET /api/markets` - 获取所有市场
- `GET /api/markets/:id` - 获取市场详情
- `POST /api/markets` - 创建新市场
- `GET /api/markets/:id/transactions` - 获取市场交易记录

### 用户相关

- `GET /api/users/:address` - 获取用户信息
- `GET /api/users/:address/portfolio` - 获取用户投资组合
- `GET /api/leaderboard` - 获取排行榜

## 开发指南

### 测试智能合约

```bash
cd contracts
npx hardhat test
```

### 本地开发网络

```bash
npx hardhat node
```

## 部署

### 部署到 Polygon

1. 配置 `hardhat.config.js` 中的网络设置
2. 运行部署脚本：
```bash
npx hardhat run scripts/deploy.js --network polygon
```

## 许可证

MIT



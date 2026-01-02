# Super Truth 预测市场平台 - BSC 版本系统总结

## 📋 系统概述

**Super Truth** 是一个基于 **BNB Chain (BSC)** 的信息中心预测市场平台，专注于加密原生和体育事件。平台采用 **CLOB (中央限价订单簿)** 交易模型，使用 **ERC1155** 代币表示持仓，**USDT/USDC** 作为抵押品。

### 核心设计原则

- ✅ **信息聚合**: 价格代表集体信念，而非赔率
- ✅ **非托管**: 所有资产完全链上，平台无法访问用户资金
- ✅ **规则驱动**: 解决过程透明、可挑战、可审计
- ✅ **最小信任**: 早期允许中心化，但绝不任意

---

## 🏗️ 系统架构

### 智能合约层

```
MarketFactory (市场工厂)
    ↓
Market (单个市场合约)
    ├── ERC1155 OutcomeToken (YES/NO 持仓)
    ├── Vault (USDT/USDC 抵押品)
    └── 生命周期管理
        ↓
Settlement (结算合约)
    ├── CLOB 订单匹配
    ├── Oracle 管理
    └── Resolution Committee 管理
```

### 后端服务层

- **Express.js API**: RESTful 接口
- **MongoDB**: 市场元数据、用户信息、交易记录
- **Web3.js**: BSC 链上数据同步

### 前端应用层

- **Vue 3**: 用户界面
- **Pinia**: 状态管理
- **Element Plus**: UI 组件
- **Ethers.js**: BSC 交互

---

## 📊 市场类型

### 1. Crypto Hard Fact Markets (主要)

**特点**:
- 链上数据事件
- 代币价格达到阈值
- 治理结果

**示例**:
- "BTC 价格在 2024-12-31 前达到 $100,000"
- "ETH 2.0 质押量在 2024-06-01 前超过 32M ETH"

### 2. Crypto Event Markets (次要)

**特点**:
- 交易所上市
- 空投分发
- 协议启动

**示例**:
- "Token X 在 2024-03-01 前在 Binance 上市"
- "Protocol Y 在 2024-06-01 前启动主网"

### 3. Sports Markets (有限范围)

**特点**:
- 比赛结果（胜/负）
- 资格或淘汰

**明确排除**:
- ❌ 让分盘
- ❌ 大小盘
- ❌ 复杂投注结构

**示例**:
- "Team A 在 2024-05-15 的比赛中获胜"
- "Player B 在 2024-06-01 前获得资格"

---

## 🔄 市场生命周期

```
1. 市场规范创建（链下）
    ↓
2. 通过 MarketFactory 部署到链上
    ↓
3. 交易开放（Trading）
    - 用户可以买卖 YES/NO 持仓
    - CLOB 订单匹配（链下）
    - 链上结算
    ↓
4. 交易关闭（Closed）
    - 到达关闭时间
    - 持仓锁定
    - 停止新交易
    ↓
5. Oracle 提议结果（Proposed）
    - Oracle 收集数据
    - 发布提议结果
    - 提供数据源引用
    ↓
6. 挑战窗口（Challenged，可选）
    - 24-72 小时挑战窗口
    - 用户可挑战（需抵押品）
    - 必须引用规则违反
    ↓
7. 市场最终化（Finalized）
    - Resolution Committee 审查（如有挑战）
    - 确定最终结果（YES/NO/INVALID）
    - 记录到链上
    ↓
8. 持仓赎回
    - 获胜持仓持有者赎回抵押品
    - 无效市场全额退款
```

---

## 📝 Market Resolution Spec

每个市场都有一个不可变的 **Market Resolution Spec**，定义：

### 必需字段

1. **事件定义** (Event Definition)
   - 精确描述要预测的事件
   - 明确的时间边界（UTC）
   - 可验证的条件

2. **数据源** (Data Sources)
   - 主要数据源（优先级最高）
   - 备用数据源
   - 数据获取方法

3. **模糊处理规则** (Ambiguity Handling)
   - 边界情况处理
   - 数据冲突解决
   - 时间窗口处理

4. **无效市场条件** (Invalid Market Conditions)
   - 什么情况下市场无效
   - 退款规则

### 示例 Resolution Spec

```json
{
  "eventDefinition": "BTC 价格在 2024-12-31 23:59:59 UTC 前达到或超过 $100,000",
  "dataSources": [
    {
      "priority": 1,
      "source": "CoinGecko API",
      "endpoint": "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      "field": "bitcoin.usd"
    },
    {
      "priority": 2,
      "source": "Binance API",
      "endpoint": "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
      "field": "price"
    }
  ],
  "timeBoundary": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-12-31T23:59:59Z"
  },
  "ambiguityHandling": {
    "priceReached": "如果价格在时间窗口内任何时刻达到 $100,000，结果为 YES",
    "dataConflict": "使用优先级最高的数据源",
    "apiFailure": "如果主要数据源失败，使用备用数据源"
  },
  "invalidConditions": [
    "如果所有数据源在时间窗口结束时都不可用，市场无效（退款）",
    "如果事件定义在时间窗口内被修改，市场无效（退款）"
  ]
}
```

---

## 🛡️ 信任与解决模型

### Oracle 角色

**职责**:
- 收集数据
- 发布提议结果
- 提供数据源引用

**限制**:
- Oracle **提议**结果，不单方面决定
- 提议可以被挑战
- 所有操作链上可审计

### 挑战机制

**流程**:
1. Oracle 提议结果后，挑战窗口打开（24-72 小时）
2. 任何用户可挑战（需抵押品，如 1000 USDT）
3. 挑战必须引用具体的规则违反
4. Resolution Committee 审查挑战
5. 如果挑战成功，结果可能改变；如果失败，挑战者失去抵押品

**挑战示例**:
```
挑战原因: "Oracle 使用了错误的数据源。根据 Resolution Spec，
主要数据源应为 CoinGecko，但 Oracle 使用了 Binance 数据，
且两个数据源存在冲突。"
```

### Resolution Committee

**组成**:
- 3-7 个多签成员
- 独立于交易系统
- 审查被挑战的市场
- 最终化结果到链上

**职责**:
- 审查挑战的有效性
- 确定最终结果
- 处理边缘情况

---

## 💱 交易模型：CLOB

### 中央限价订单簿 (CLOB)

**特点**:
- 订单匹配在链下进行（更快、更便宜）
- 最终结算在链上（安全、透明）
- 显示的价格代表**隐含概率**，而非赔率

### 交易流程

```
1. 用户提交订单（链下）
   - 限价单或市价单
   - 指定价格和数量
   ↓
2. 订单匹配（链下）
   - 匹配引擎找到对手方
   - 计算匹配价格和数量
   ↓
3. 链上结算（Settlement 合约）
   - 买方支付，获得持仓
   - 卖方销毁持仓，获得支付
   - 所有操作原子性执行
```

### 价格显示

**隐含概率计算**:
```
YES 价格 = YES 订单簿最佳买价
NO 价格 = NO 订单簿最佳买价

隐含概率 (YES) = YES 价格 / (YES 价格 + NO 价格)
隐含概率 (NO) = NO 价格 / (YES 价格 + NO 价格)
```

---

## 💰 资产与托管模型

### 抵押品

- **USDT** (BEP20)
- **USDC** (BEP20)

### 持仓代币

- **ERC1155 OutcomeToken**
- 每个市场有两个代币：
  - Token ID 0: NO
  - Token ID 1: YES

### 托管保证

- ✅ 所有抵押品存储在链上 Vault 合约
- ✅ 平台运营商无法访问用户资金
- ✅ 智能合约强制执行所有转账
- ✅ 即使平台消失，用户资金仍然安全
- ✅ 市场规则一旦开始交易就不能更改

---

## 🎯 风险控制

### 市场级别

- **持仓上限**: 每个市场设置最大持仓量
- **价格波动限制**: 防止异常价格波动
- **市场暂停**: 极端异常时暂停交易

### 应用范围

- 风险控制仅应用于**订单匹配**，不应用于**托管**
- 用户资金始终安全，不受风险控制影响

---

## 📱 前端功能

### 市场浏览

- **分类筛选**: Crypto Hard Fact / Crypto Event / Sports
- **状态筛选**: Trading / Closed / Proposed / Challenged / Finalized
- **搜索**: 按问题、标签搜索

### 市场详情

- **基本信息**: 问题、类型、关闭时间
- **Resolution Spec**: 完整显示
- **生命周期状态**: 当前状态和下一步
- **订单簿**: YES/NO 买卖盘
- **持仓**: 用户当前持仓

### 交易界面

- **订单簿**: 实时买卖盘显示
- **下单**: 限价单/市价单
- **持仓管理**: 查看、赎回持仓

### 挑战界面

- **查看提议**: Oracle 提议的结果和数据源
- **提交挑战**: 填写挑战原因和抵押品
- **查看挑战**: 当前挑战状态

---

## 🔌 API 接口

### 市场相关

- `GET /api/markets` - 获取市场列表
- `GET /api/markets/:id` - 获取市场详情
- `POST /api/markets` - 创建市场（链下规范）
- `GET /api/markets/:id/spec` - 获取 Resolution Spec
- `PATCH /api/markets/:id/status` - 更新市场状态

### 交易相关

- `POST /api/orders` - 提交订单（链下匹配）
- `POST /api/orders/settle` - 结算订单（链上）
- `GET /api/orders/:id` - 获取订单状态
- `GET /api/markets/:id/orderbook` - 获取订单簿

### 挑战相关

- `GET /api/markets/:id/proposal` - 获取 Oracle 提议
- `POST /api/markets/:id/challenge` - 提交挑战
- `GET /api/markets/:id/challenge` - 获取挑战信息

---

## 🔐 安全机制

### 智能合约

- **ReentrancyGuard**: 防止重入攻击
- **Ownable**: 访问控制
- **SafeERC20**: 安全的 ERC20 操作
- **事件记录**: 所有操作链上可审计

### 后端

- **输入验证**: express-validator
- **CORS 配置**: 限制跨域请求
- **错误处理**: 统一错误响应
- **数据库连接**: 超时和重连机制

### 前端

- **钱包连接验证**: MetaMask 等
- **交易确认提示**: 所有链上操作需确认
- **错误处理**: 友好的错误提示

---

## 📈 未来路线图

### 短期（3-6个月）

- [ ] 乐观或去中心化 Oracle 集成
- [ ] 自动市场生成
- [ ] 预测者声誉系统

### 中期（6-12个月）

- [ ] DAO 治理的解决机制
- [ ] 更多市场类型支持
- [ ] 移动端应用

### 长期（12+个月）

- [ ] 跨链支持
- [ ] 高级分析工具
- [ ] 社交功能

---

## ⚠️ 免责声明

本平台提供市场来表达对现实世界事件的概率信念。它不保证结果的正确性，但保证**解决过程是透明、规则驱动和可审计的**。

所有市场都有公开的规范，所有解决都记录在链上，所有争议都是可追溯的。平台设计使得**错误是可见和昂贵的**，而不是隐藏的。

---

## 📚 相关文档

- [BSC_DESIGN.md](./BSC_DESIGN.md) - 完整设计文档
- [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) - 迁移计划
- [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) - 原系统概述





## 📋 系统概述

**Super Truth** 是一个基于 **BNB Chain (BSC)** 的信息中心预测市场平台，专注于加密原生和体育事件。平台采用 **CLOB (中央限价订单簿)** 交易模型，使用 **ERC1155** 代币表示持仓，**USDT/USDC** 作为抵押品。

### 核心设计原则

- ✅ **信息聚合**: 价格代表集体信念，而非赔率
- ✅ **非托管**: 所有资产完全链上，平台无法访问用户资金
- ✅ **规则驱动**: 解决过程透明、可挑战、可审计
- ✅ **最小信任**: 早期允许中心化，但绝不任意

---

## 🏗️ 系统架构

### 智能合约层

```
MarketFactory (市场工厂)
    ↓
Market (单个市场合约)
    ├── ERC1155 OutcomeToken (YES/NO 持仓)
    ├── Vault (USDT/USDC 抵押品)
    └── 生命周期管理
        ↓
Settlement (结算合约)
    ├── CLOB 订单匹配
    ├── Oracle 管理
    └── Resolution Committee 管理
```

### 后端服务层

- **Express.js API**: RESTful 接口
- **MongoDB**: 市场元数据、用户信息、交易记录
- **Web3.js**: BSC 链上数据同步

### 前端应用层

- **Vue 3**: 用户界面
- **Pinia**: 状态管理
- **Element Plus**: UI 组件
- **Ethers.js**: BSC 交互

---

## 📊 市场类型

### 1. Crypto Hard Fact Markets (主要)

**特点**:
- 链上数据事件
- 代币价格达到阈值
- 治理结果

**示例**:
- "BTC 价格在 2024-12-31 前达到 $100,000"
- "ETH 2.0 质押量在 2024-06-01 前超过 32M ETH"

### 2. Crypto Event Markets (次要)

**特点**:
- 交易所上市
- 空投分发
- 协议启动

**示例**:
- "Token X 在 2024-03-01 前在 Binance 上市"
- "Protocol Y 在 2024-06-01 前启动主网"

### 3. Sports Markets (有限范围)

**特点**:
- 比赛结果（胜/负）
- 资格或淘汰

**明确排除**:
- ❌ 让分盘
- ❌ 大小盘
- ❌ 复杂投注结构

**示例**:
- "Team A 在 2024-05-15 的比赛中获胜"
- "Player B 在 2024-06-01 前获得资格"

---

## 🔄 市场生命周期

```
1. 市场规范创建（链下）
    ↓
2. 通过 MarketFactory 部署到链上
    ↓
3. 交易开放（Trading）
    - 用户可以买卖 YES/NO 持仓
    - CLOB 订单匹配（链下）
    - 链上结算
    ↓
4. 交易关闭（Closed）
    - 到达关闭时间
    - 持仓锁定
    - 停止新交易
    ↓
5. Oracle 提议结果（Proposed）
    - Oracle 收集数据
    - 发布提议结果
    - 提供数据源引用
    ↓
6. 挑战窗口（Challenged，可选）
    - 24-72 小时挑战窗口
    - 用户可挑战（需抵押品）
    - 必须引用规则违反
    ↓
7. 市场最终化（Finalized）
    - Resolution Committee 审查（如有挑战）
    - 确定最终结果（YES/NO/INVALID）
    - 记录到链上
    ↓
8. 持仓赎回
    - 获胜持仓持有者赎回抵押品
    - 无效市场全额退款
```

---

## 📝 Market Resolution Spec

每个市场都有一个不可变的 **Market Resolution Spec**，定义：

### 必需字段

1. **事件定义** (Event Definition)
   - 精确描述要预测的事件
   - 明确的时间边界（UTC）
   - 可验证的条件

2. **数据源** (Data Sources)
   - 主要数据源（优先级最高）
   - 备用数据源
   - 数据获取方法

3. **模糊处理规则** (Ambiguity Handling)
   - 边界情况处理
   - 数据冲突解决
   - 时间窗口处理

4. **无效市场条件** (Invalid Market Conditions)
   - 什么情况下市场无效
   - 退款规则

### 示例 Resolution Spec

```json
{
  "eventDefinition": "BTC 价格在 2024-12-31 23:59:59 UTC 前达到或超过 $100,000",
  "dataSources": [
    {
      "priority": 1,
      "source": "CoinGecko API",
      "endpoint": "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      "field": "bitcoin.usd"
    },
    {
      "priority": 2,
      "source": "Binance API",
      "endpoint": "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
      "field": "price"
    }
  ],
  "timeBoundary": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-12-31T23:59:59Z"
  },
  "ambiguityHandling": {
    "priceReached": "如果价格在时间窗口内任何时刻达到 $100,000，结果为 YES",
    "dataConflict": "使用优先级最高的数据源",
    "apiFailure": "如果主要数据源失败，使用备用数据源"
  },
  "invalidConditions": [
    "如果所有数据源在时间窗口结束时都不可用，市场无效（退款）",
    "如果事件定义在时间窗口内被修改，市场无效（退款）"
  ]
}
```

---

## 🛡️ 信任与解决模型

### Oracle 角色

**职责**:
- 收集数据
- 发布提议结果
- 提供数据源引用

**限制**:
- Oracle **提议**结果，不单方面决定
- 提议可以被挑战
- 所有操作链上可审计

### 挑战机制

**流程**:
1. Oracle 提议结果后，挑战窗口打开（24-72 小时）
2. 任何用户可挑战（需抵押品，如 1000 USDT）
3. 挑战必须引用具体的规则违反
4. Resolution Committee 审查挑战
5. 如果挑战成功，结果可能改变；如果失败，挑战者失去抵押品

**挑战示例**:
```
挑战原因: "Oracle 使用了错误的数据源。根据 Resolution Spec，
主要数据源应为 CoinGecko，但 Oracle 使用了 Binance 数据，
且两个数据源存在冲突。"
```

### Resolution Committee

**组成**:
- 3-7 个多签成员
- 独立于交易系统
- 审查被挑战的市场
- 最终化结果到链上

**职责**:
- 审查挑战的有效性
- 确定最终结果
- 处理边缘情况

---

## 💱 交易模型：CLOB

### 中央限价订单簿 (CLOB)

**特点**:
- 订单匹配在链下进行（更快、更便宜）
- 最终结算在链上（安全、透明）
- 显示的价格代表**隐含概率**，而非赔率

### 交易流程

```
1. 用户提交订单（链下）
   - 限价单或市价单
   - 指定价格和数量
   ↓
2. 订单匹配（链下）
   - 匹配引擎找到对手方
   - 计算匹配价格和数量
   ↓
3. 链上结算（Settlement 合约）
   - 买方支付，获得持仓
   - 卖方销毁持仓，获得支付
   - 所有操作原子性执行
```

### 价格显示

**隐含概率计算**:
```
YES 价格 = YES 订单簿最佳买价
NO 价格 = NO 订单簿最佳买价

隐含概率 (YES) = YES 价格 / (YES 价格 + NO 价格)
隐含概率 (NO) = NO 价格 / (YES 价格 + NO 价格)
```

---

## 💰 资产与托管模型

### 抵押品

- **USDT** (BEP20)
- **USDC** (BEP20)

### 持仓代币

- **ERC1155 OutcomeToken**
- 每个市场有两个代币：
  - Token ID 0: NO
  - Token ID 1: YES

### 托管保证

- ✅ 所有抵押品存储在链上 Vault 合约
- ✅ 平台运营商无法访问用户资金
- ✅ 智能合约强制执行所有转账
- ✅ 即使平台消失，用户资金仍然安全
- ✅ 市场规则一旦开始交易就不能更改

---

## 🎯 风险控制

### 市场级别

- **持仓上限**: 每个市场设置最大持仓量
- **价格波动限制**: 防止异常价格波动
- **市场暂停**: 极端异常时暂停交易

### 应用范围

- 风险控制仅应用于**订单匹配**，不应用于**托管**
- 用户资金始终安全，不受风险控制影响

---

## 📱 前端功能

### 市场浏览

- **分类筛选**: Crypto Hard Fact / Crypto Event / Sports
- **状态筛选**: Trading / Closed / Proposed / Challenged / Finalized
- **搜索**: 按问题、标签搜索

### 市场详情

- **基本信息**: 问题、类型、关闭时间
- **Resolution Spec**: 完整显示
- **生命周期状态**: 当前状态和下一步
- **订单簿**: YES/NO 买卖盘
- **持仓**: 用户当前持仓

### 交易界面

- **订单簿**: 实时买卖盘显示
- **下单**: 限价单/市价单
- **持仓管理**: 查看、赎回持仓

### 挑战界面

- **查看提议**: Oracle 提议的结果和数据源
- **提交挑战**: 填写挑战原因和抵押品
- **查看挑战**: 当前挑战状态

---

## 🔌 API 接口

### 市场相关

- `GET /api/markets` - 获取市场列表
- `GET /api/markets/:id` - 获取市场详情
- `POST /api/markets` - 创建市场（链下规范）
- `GET /api/markets/:id/spec` - 获取 Resolution Spec
- `PATCH /api/markets/:id/status` - 更新市场状态

### 交易相关

- `POST /api/orders` - 提交订单（链下匹配）
- `POST /api/orders/settle` - 结算订单（链上）
- `GET /api/orders/:id` - 获取订单状态
- `GET /api/markets/:id/orderbook` - 获取订单簿

### 挑战相关

- `GET /api/markets/:id/proposal` - 获取 Oracle 提议
- `POST /api/markets/:id/challenge` - 提交挑战
- `GET /api/markets/:id/challenge` - 获取挑战信息

---

## 🔐 安全机制

### 智能合约

- **ReentrancyGuard**: 防止重入攻击
- **Ownable**: 访问控制
- **SafeERC20**: 安全的 ERC20 操作
- **事件记录**: 所有操作链上可审计

### 后端

- **输入验证**: express-validator
- **CORS 配置**: 限制跨域请求
- **错误处理**: 统一错误响应
- **数据库连接**: 超时和重连机制

### 前端

- **钱包连接验证**: MetaMask 等
- **交易确认提示**: 所有链上操作需确认
- **错误处理**: 友好的错误提示

---

## 📈 未来路线图

### 短期（3-6个月）

- [ ] 乐观或去中心化 Oracle 集成
- [ ] 自动市场生成
- [ ] 预测者声誉系统

### 中期（6-12个月）

- [ ] DAO 治理的解决机制
- [ ] 更多市场类型支持
- [ ] 移动端应用

### 长期（12+个月）

- [ ] 跨链支持
- [ ] 高级分析工具
- [ ] 社交功能

---

## ⚠️ 免责声明

本平台提供市场来表达对现实世界事件的概率信念。它不保证结果的正确性，但保证**解决过程是透明、规则驱动和可审计的**。

所有市场都有公开的规范，所有解决都记录在链上，所有争议都是可追溯的。平台设计使得**错误是可见和昂贵的**，而不是隐藏的。

---

## 📚 相关文档

- [BSC_DESIGN.md](./BSC_DESIGN.md) - 完整设计文档
- [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) - 迁移计划
- [SYSTEM_OVERVIEW.md](./SYSTEM_OVERVIEW.md) - 原系统概述





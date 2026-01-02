# 系统迁移计划：从 AMM 到 CLOB + BSC

## 概述

将现有系统从 Polygon + AMM 模型迁移到 BSC + CLOB 模型，实现信息中心预测市场平台。

## 迁移步骤

### 阶段 1: 智能合约重构 ✅

- [x] 创建 `MarketFactory.sol` - 市场工厂合约
- [x] 创建 `Market.sol` - 单个市场合约（ERC1155）
- [x] 创建 `Settlement.sol` - 结算合约（CLOB）
- [ ] 更新 `Oracle.sol` - 支持提议和挑战机制
- [ ] 创建 `Vault.sol` - 抵押品管理（USDT/USDC）
- [ ] 更新部署脚本以支持 BSC

### 阶段 2: 市场类型和生命周期

- [ ] 实现市场类型枚举：CryptoHardFact, CryptoEvent, Sports
- [ ] 实现市场生命周期状态机：
  - Trading → Closed → Proposed → (Challenged) → Finalized
- [ ] 实现 Market Resolution Spec 结构
- [ ] 实现挑战窗口机制

### 阶段 3: 交易模型迁移

- [ ] 从 AMM 改为 CLOB
- [ ] 实现链下订单匹配
- [ ] 实现链上结算
- [ ] 更新前端交易界面

### 阶段 4: 资产模型迁移

- [ ] 从 ERC20 MarketToken 改为 ERC1155 OutcomeToken
- [ ] 支持 USDT/USDC 作为抵押品
- [ ] 更新余额显示逻辑

### 阶段 5: 后端 API 更新

- [ ] 更新市场模型以支持新状态
- [ ] 添加市场类型字段
- [ ] 添加 Resolution Spec 字段
- [ ] 添加挑战相关 API
- [ ] 更新交易记录模型

### 阶段 6: 前端界面更新

- [ ] 更新市场创建表单（添加市场类型和 Resolution Spec）
- [ ] 更新市场详情页（显示生命周期状态）
- [ ] 添加挑战界面
- [ ] 更新交易界面（CLOB 订单簿）
- [ ] 更新持仓显示（ERC1155）

### 阶段 7: 测试和部署

- [ ] 单元测试
- [ ] 集成测试
- [ ] BSC 测试网部署
- [ ] 主网部署

## 关键变更对比

| 项目 | 旧系统 | 新系统 |
|------|--------|--------|
| 区块链 | Polygon | BSC (BNB Chain) |
| 交易模型 | AMM (自动做市商) | CLOB (中央限价订单簿) |
| 代币标准 | ERC20 | ERC1155 |
| 抵押品 | MarketToken | USDT/USDC |
| 市场类型 | 通用 | Crypto Hard Fact / Crypto Event / Sports |
| 生命周期 | 简单（开放/关闭/结算） | 复杂（交易/关闭/提议/挑战/最终化） |
| 解决机制 | Oracle 直接决定 | Oracle 提议 + 挑战 + Committee 最终化 |

## 注意事项

1. **向后兼容性**: 旧市场数据需要迁移或标记为遗留
2. **用户体验**: CLOB 模型需要订单簿界面，用户体验需要重新设计
3. **Gas 成本**: BSC 的 Gas 成本较低，但需要优化合约
4. **流动性**: 从 AMM 到 CLOB 需要重新建立流动性

## 时间线

- 第1-2周: 智能合约开发和测试
- 第3周: 后端 API 更新
- 第4周: 前端界面更新
- 第5周: 集成测试和 BSC 测试网部署
- 第6周: 主网部署和监控





## 概述

将现有系统从 Polygon + AMM 模型迁移到 BSC + CLOB 模型，实现信息中心预测市场平台。

## 迁移步骤

### 阶段 1: 智能合约重构 ✅

- [x] 创建 `MarketFactory.sol` - 市场工厂合约
- [x] 创建 `Market.sol` - 单个市场合约（ERC1155）
- [x] 创建 `Settlement.sol` - 结算合约（CLOB）
- [ ] 更新 `Oracle.sol` - 支持提议和挑战机制
- [ ] 创建 `Vault.sol` - 抵押品管理（USDT/USDC）
- [ ] 更新部署脚本以支持 BSC

### 阶段 2: 市场类型和生命周期

- [ ] 实现市场类型枚举：CryptoHardFact, CryptoEvent, Sports
- [ ] 实现市场生命周期状态机：
  - Trading → Closed → Proposed → (Challenged) → Finalized
- [ ] 实现 Market Resolution Spec 结构
- [ ] 实现挑战窗口机制

### 阶段 3: 交易模型迁移

- [ ] 从 AMM 改为 CLOB
- [ ] 实现链下订单匹配
- [ ] 实现链上结算
- [ ] 更新前端交易界面

### 阶段 4: 资产模型迁移

- [ ] 从 ERC20 MarketToken 改为 ERC1155 OutcomeToken
- [ ] 支持 USDT/USDC 作为抵押品
- [ ] 更新余额显示逻辑

### 阶段 5: 后端 API 更新

- [ ] 更新市场模型以支持新状态
- [ ] 添加市场类型字段
- [ ] 添加 Resolution Spec 字段
- [ ] 添加挑战相关 API
- [ ] 更新交易记录模型

### 阶段 6: 前端界面更新

- [ ] 更新市场创建表单（添加市场类型和 Resolution Spec）
- [ ] 更新市场详情页（显示生命周期状态）
- [ ] 添加挑战界面
- [ ] 更新交易界面（CLOB 订单簿）
- [ ] 更新持仓显示（ERC1155）

### 阶段 7: 测试和部署

- [ ] 单元测试
- [ ] 集成测试
- [ ] BSC 测试网部署
- [ ] 主网部署

## 关键变更对比

| 项目 | 旧系统 | 新系统 |
|------|--------|--------|
| 区块链 | Polygon | BSC (BNB Chain) |
| 交易模型 | AMM (自动做市商) | CLOB (中央限价订单簿) |
| 代币标准 | ERC20 | ERC1155 |
| 抵押品 | MarketToken | USDT/USDC |
| 市场类型 | 通用 | Crypto Hard Fact / Crypto Event / Sports |
| 生命周期 | 简单（开放/关闭/结算） | 复杂（交易/关闭/提议/挑战/最终化） |
| 解决机制 | Oracle 直接决定 | Oracle 提议 + 挑战 + Committee 最终化 |

## 注意事项

1. **向后兼容性**: 旧市场数据需要迁移或标记为遗留
2. **用户体验**: CLOB 模型需要订单簿界面，用户体验需要重新设计
3. **Gas 成本**: BSC 的 Gas 成本较低，但需要优化合约
4. **流动性**: 从 AMM 到 CLOB 需要重新建立流动性

## 时间线

- 第1-2周: 智能合约开发和测试
- 第3周: 后端 API 更新
- 第4周: 前端界面更新
- 第5周: 集成测试和 BSC 测试网部署
- 第6周: 主网部署和监控





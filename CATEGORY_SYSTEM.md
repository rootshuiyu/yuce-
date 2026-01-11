# Super Truth 分类体系和运营管理流程

## 1. 分类体系设计

### 1.1 分类结构

```
一级分类（Category）
├── 二级分类（Subcategory）
│   ├── 话题市场 1
│   ├── 话题市场 2
│   └── 话题市场 3
└── ...
```

### 1.2 一级分类列表

| 分类 ID | 分类名称 | 描述 | 图标 |
|--------|--------|------|------|
| politics | 政治 | 政治选举、政策相关市场 | 🏛️ |
| sports | 体育 | 体育赛事、运动员相关市场 | ⚽ |
| crypto | 加密 | 加密货币、区块链相关市场 | ₿ |
| finance | 金融 | 股票、汇率、经济指标市场 | 💰 |
| tech | 科技 | 科技产品、AI、互联网市场 | 💻 |
| culture | 文化 | 娱乐、电影、音乐市场 | 🎭 |
| climate | 气候 | 气候变化、环保相关市场 | 🌍 |
| world | 世界 | 国际事件、地缘政治市场 | 🌐 |

### 1.3 二级分类示例

#### 政治分类
- 美国选举
- 欧洲政治
- 亚洲政治
- 中东政治
- 政策法规

#### 体育分类
- 足球
- 篮球
- 棒球
- 网球
- 奥运会

#### 加密分类
- 比特币
- 以太坊
- DeFi
- NFT
- Layer 2

#### 金融分类
- 美股
- 外汇
- 商品期货
- 利率
- 经济数据

## 2. 数据库设计

### 2.1 分类表 (categories)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  parent_id UUID REFERENCES categories(id),
  display_order INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 市场表扩展 (markets)

```sql
ALTER TABLE markets ADD COLUMN (
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES categories(id),
  status ENUM('draft', 'pending', 'active', 'resolved', 'cancelled') DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP
);
```

## 3. 市场创建流程

### 3.1 创建流程图

```
用户提交市场 → 后端验证 → 管理员审核 → 市场上线
     ↓
  - 标题
  - 描述
  - 分类
  - 结束时间
  - 结果来源
```

### 3.2 创建步骤

1. **用户提交**
   - 选择一级分类
   - 选择二级分类
   - 输入市场标题
   - 输入市场描述
   - 设置结束时间
   - 指定结果来源

2. **后端验证**
   - 检查分类是否有效
   - 检查标题长度和内容
   - 检查结束时间是否合理
   - 检查用户权限

3. **管理员审核**
   - 检查市场内容是否合规
   - 检查是否存在重复市场
   - 检查结果来源是否可靠
   - 批准或拒绝

4. **市场上线**
   - 市场状态变为 'active'
   - 在前端显示
   - 用户可以交易

## 4. 前端展示逻辑

### 4.1 左侧导航

```
热门活动
├── 🔥 热门市场
├── ✨ 最新市场
└── 📊 我的头寸

分类浏览
├── 🏛️ 政治
│   ├── 美国选举
│   ├── 欧洲政治
│   └── ...
├── ⚽ 体育
│   ├── 足球
│   ├── 篮球
│   └── ...
└── ...

个人中心
├── 📊 我的头寸
├── 📜 交易历史
└── ⭐ 收藏市场
```

### 4.2 主内容区

- 显示选定分类下的所有市场
- 支持排序（交易量、概率、最新）
- 支持过滤（交易中、已结束）
- 显示市场卡片（标题、概率、交易量）

### 4.3 市场卡片

```
┌─────────────────────────────┐
│ 市场标题                     │
│ 分类 | 结束时间              │
├─────────────────────────────┤
│ ✓ YES  [████████░░] 80%     │
│ ✗ NO   [██░░░░░░░░] 20%     │
├─────────────────────────────┤
│ [YES 按钮] [NO 按钮]        │
├─────────────────────────────┤
│ 💰 交易量: $1.2M            │
└─────────────────────────────┘
```

## 5. 运营管理后台

### 5.1 管理员功能

- 分类管理
  - 创建/编辑/删除分类
  - 设置分类顺序
  - 启用/禁用分类

- 市场审核
  - 查看待审核市场
  - 批准/拒绝市场
  - 编辑市场信息

- 用户管理
  - 查看用户列表
  - 冻结/解冻用户账户
  - 查看用户交易记录

- 数据统计
  - 市场统计
  - 交易统计
  - 用户统计

### 5.2 管理员界面路由

```
/admin
├── /admin/categories      # 分类管理
├── /admin/markets         # 市场审核
├── /admin/users           # 用户管理
└── /admin/analytics       # 数据统计
```

## 6. API 端点设计

### 6.1 分类相关

```
GET /api/categories                    # 获取所有分类
GET /api/categories/:id                # 获取分类详情
GET /api/categories/:id/subcategories  # 获取子分类
GET /api/categories/:id/markets        # 获取分类下的市场
```

### 6.2 市场相关

```
GET /api/markets                       # 获取市场列表
GET /api/markets/:id                   # 获取市场详情
POST /api/markets                      # 创建市场（需要审核）
PUT /api/markets/:id                   # 编辑市场
DELETE /api/markets/:id                # 删除市场

GET /api/markets/pending               # 获取待审核市场（管理员）
POST /api/markets/:id/approve          # 批准市场（管理员）
POST /api/markets/:id/reject           # 拒绝市场（管理员）
```

## 7. 前端状态管理

### 7.1 Store 结构

```
categoryStore
├── categories[]           # 所有分类
├── selectedCategory       # 当前选中分类
├── fetchCategories()      # 获取分类
└── getSubcategories()     # 获取子分类

marketStore
├── markets[]              # 市场列表
├── selectedMarket         # 当前选中市场
├── fetchMarkets()         # 获取市场
├── createMarket()         # 创建市场
└── filterMarkets()        # 过滤市场
```

## 8. 实现优先级

### Phase 1（MVP）
- ✅ 基础分类体系（5-8个一级分类）
- ✅ 市场创建和展示
- ✅ 基础交易功能

### Phase 2
- 分类管理后台
- 市场审核流程
- 用户权限管理

### Phase 3
- 高级过滤和搜索
- 市场推荐算法
- 用户个性化

## 9. 示例数据

### 初始分类数据

```json
[
  {
    "id": "cat_politics",
    "name": "政治",
    "slug": "politics",
    "icon": "🏛️",
    "subcategories": [
      {
        "id": "subcat_us_election",
        "name": "美国选举",
        "slug": "us-election"
      },
      {
        "id": "subcat_eu_politics",
        "name": "欧洲政治",
        "slug": "eu-politics"
      }
    ]
  },
  {
    "id": "cat_sports",
    "name": "体育",
    "slug": "sports",
    "icon": "⚽",
    "subcategories": [
      {
        "id": "subcat_football",
        "name": "足球",
        "slug": "football"
      },
      {
        "id": "subcat_basketball",
        "name": "篮球",
        "slug": "basketball"
      }
    ]
  }
]
```

## 10. 安全考虑

- 市场创建需要用户认证
- 市场审核需要管理员权限
- 市场内容需要过滤敏感词汇
- 市场结果需要可信来源验证
- 交易需要防止操纵和欺诈

# 分类系统实现文档

## 概述

预测市场平台的分类系统已完全重新设计和实现，采用两层级结构：
- **一级分类**：8 个固定的主要分类（政治、体育、加密、金融、科技、文化、气候、世界）
- **二级分类**：可自定义的话题分类，每个一级分类下可有多个二级分类

## 架构设计

### 后端架构

#### 分类服务 (`src/services/categoryService.js`)

**固定的一级分类**：
```javascript
const PRIMARY_CATEGORIES = [
  { id: 'cat_politics', name: '政治', slug: 'politics', icon: '🏛️', displayOrder: 1 },
  { id: 'cat_sports', name: '体育', slug: 'sports', icon: '⚽', displayOrder: 2 },
  { id: 'cat_crypto', name: '加密', slug: 'crypto', icon: '₿', displayOrder: 3 },
  { id: 'cat_finance', name: '金融', slug: 'finance', icon: '💰', displayOrder: 4 },
  { id: 'cat_tech', name: '科技', slug: 'tech', icon: '💻', displayOrder: 5 },
  { id: 'cat_culture', name: '文化', slug: 'culture', icon: '🎭', displayOrder: 6 },
  { id: 'cat_climate', name: '气候', slug: 'climate', icon: '🌍', displayOrder: 7 },
  { id: 'cat_world', name: '世界', slug: 'world', icon: '🌐', displayOrder: 8 }
];
```

**关键方法**：
- `getPrimaryCategories()` - 获取所有一级分类
- `getAllCategories()` - 获取所有分类（一级+二级）
- `getSubcategoriesByParentId(parentId)` - 获取指定一级分类的所有二级分类
- `createSubcategory(parentId, subcategoryData)` - 创建二级分类
- `initializeDefaultCategories()` - 初始化默认二级分类

#### API 端点 (`src/routes/categoryRoutes.js`)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/categories/primary` | 获取所有一级分类 |
| GET | `/api/categories` | 获取所有分类（一级+二级） |
| GET | `/api/categories/stats` | 获取分类统计信息 |
| POST | `/api/categories/init/default` | 初始化默认二级分类 |
| GET | `/api/categories/:id` | 获取分类详情 |
| GET | `/api/categories/:id/subcategories` | 获取二级分类列表 |
| GET | `/api/categories/:id/markets` | 获取分类下的市场 |
| POST | `/api/categories/:parentId/subcategories` | 创建二级分类（管理员） |
| POST | `/api/categories` | 创建分类（通用） |
| PUT | `/api/categories/:id` | 更新分类（管理员） |
| DELETE | `/api/categories/:id` | 删除分类（管理员） |

### 前端架构

#### 应用布局 (`src/App.vue`)

**三层布局结构**：

1. **顶部导航栏**
   - Logo 和品牌名称
   - 8 个一级分类按钮（水平排列）
   - 搜索框
   - 余额显示
   - 钱包连接按钮

2. **左侧边栏**
   - 当前选中的一级分类名称
   - 热门部分（热门活动、最新市场）
   - 分类部分（该一级分类的所有二级分类）
   - 我的部分（我的头寸、交易历史）
   - 创建市场按钮

3. **主内容区**
   - 市场列表显示
   - 根据选中的分类过滤

#### 分类 Store (`src/stores/category.js`)

**状态管理**：
- `categories` - 所有分类数据
- `selectedCategory` - 当前选中的一级分类
- `selectedSubcategory` - 当前选中的二级分类
- `loading` - 加载状态
- `error` - 错误信息

**关键方法**：
- `fetchCategories()` - 获取所有分类
- `getCategoryById(id)` - 获取分类详情
- `getSubcategories(categoryId)` - 获取子分类
- `getCategoryMarkets(categoryId, options)` - 获取分类下的市场
- `createCategory(categoryData)` - 创建分类
- `updateCategory(categoryId, updateData)` - 更新分类
- `deleteCategory(categoryId)` - 删除分类

## 使用示例

### 后端 API 调用

#### 1. 获取所有一级分类
```bash
curl http://localhost:3000/api/categories/primary
```

响应：
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_politics",
      "name": "政治",
      "icon": "🏛️",
      "slug": "politics",
      "displayOrder": 1
    },
    ...
  ]
}
```

#### 2. 获取所有分类（包括二级分类）
```bash
curl http://localhost:3000/api/categories
```

响应：
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_politics",
      "name": "政治",
      "icon": "🏛️",
      "subcategories": [
        {
          "id": "subcat_1768129666793_pzmbaysqf",
          "name": "美国选举",
          "slug": "us-election",
          "parentId": "cat_politics"
        },
        ...
      ]
    },
    ...
  ]
}
```

#### 3. 创建新的二级分类
```bash
curl -X POST http://localhost:3000/api/categories/cat_politics/subcategories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "中国政治",
    "slug": "china-politics"
  }'
```

响应：
```json
{
  "success": true,
  "data": {
    "id": "subcat_1768129740117_1cp2bjaiz",
    "name": "中国政治",
    "slug": "china-politics",
    "parentId": "cat_politics",
    "displayOrder": 4
  },
  "message": "二级分类创建成功"
}
```

#### 4. 获取分类统计
```bash
curl http://localhost:3000/api/categories/stats
```

响应：
```json
{
  "success": true,
  "data": {
    "primaryCategories": 8,
    "subcategories": 23,
    "total": 31
  }
}
```

### 前端使用

#### 1. 在 Vue 组件中使用分类 Store
```vue
<script setup>
import { useCategoryStore } from '@/stores/category'

const categoryStore = useCategoryStore()

// 获取所有分类
await categoryStore.fetchCategories()

// 获取分类详情
const category = await categoryStore.getCategoryById('cat_politics')

// 获取子分类
const subcategories = await categoryStore.getSubcategories('cat_politics')
</script>
```

#### 2. 在模板中显示分类
```vue
<template>
  <div>
    <!-- 显示一级分类按钮 -->
    <button
      v-for="category in primaryCategories"
      :key="category.id"
      @click="selectCategory(category.id)"
    >
      {{ category.icon }} {{ category.name }}
    </button>

    <!-- 显示二级分类 -->
    <div
      v-for="subcat in subcategories"
      :key="subcat.id"
      @click="selectSubcategory(subcat.id)"
    >
      {{ subcat.name }}
    </div>
  </div>
</template>
```

## 数据流

### 用户交互流程

1. **页面加载**
   - 前端加载时获取所有一级分类
   - 默认选中第一个一级分类（政治）
   - 加载该分类的所有二级分类

2. **用户点击一级分类**
   - 更新 `selectedPrimaryCategory`
   - 调用 API 获取该分类的二级分类
   - 左侧边栏更新显示新的二级分类列表

3. **用户点击二级分类**
   - 更新 `selectedSubcategory`
   - 触发市场列表过滤（待实现）

4. **用户创建新的二级分类**
   - 调用 `POST /api/categories/:parentId/subcategories`
   - 后端验证父分类存在
   - 创建新的二级分类
   - 前端刷新该分类的二级分类列表

## 默认二级分类

系统初始化时会创建以下默认二级分类：

### 政治 (cat_politics)
- 美国选举
- 欧洲政治
- 亚洲政治

### 体育 (cat_sports)
- 足球
- 篮球
- 网球

### 加密 (cat_crypto)
- 比特币
- 以太坊
- DeFi

### 金融 (cat_finance)
- 美股
- 外汇
- 商品

### 科技 (cat_tech)
- AI
- 创业
- 互联网

### 文化 (cat_culture)
- 电影
- 音乐
- 奖项

### 气候 (cat_climate)
- 环保
- 天气

### 世界 (cat_world)
- 地缘政治
- 国际事件

## 样式和主题

### 颜色方案
```css
--color-dark-bg: #0f0a1a;           /* 深紫黑背景 */
--color-dark-surface: #1a1428;      /* 表面颜色 */
--color-dark-card: #2a1f3d;         /* 卡片颜色 */
--color-dark-border: #3d2f52;       /* 边框颜色 */
--color-purple-primary: #a78bfa;    /* 主紫色 */
--color-purple-light: #c4b5fd;      /* 浅紫色 */
--color-yes: #10b981;               /* YES 按钮（绿色） */
--color-no: #ef4444;                /* NO 按钮（红色） */
```

### 响应式设计

- **桌面版** (> 1024px)：完整的三列布局
- **平板版** (768px - 1024px)：左侧边栏宽度减小
- **手机版** (< 768px)：可能需要改为移动导航

## 管理员功能

### 创建二级分类
```bash
curl -X POST http://localhost:3000/api/categories/cat_politics/subcategories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新话题",
    "slug": "new-topic",
    "description": "话题描述",
    "icon": "🎯",
    "displayOrder": 5
  }'
```

### 更新分类
```bash
curl -X PUT http://localhost:3000/api/categories/subcat_xxx \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新的名称",
    "description": "更新的描述"
  }'
```

### 删除分类
```bash
curl -X DELETE http://localhost:3000/api/categories/subcat_xxx
```

## 未来改进

1. **市场过滤** - 实现按分类过滤市场列表
2. **分类搜索** - 添加分类搜索功能
3. **分类排序** - 支持自定义排序
4. **权限管理** - 实现管理员权限验证
5. **分类图标** - 支持自定义分类图标
6. **分类描述** - 添加分类详细描述

## 故障排除

### 问题：前端无法加载分类
**解决方案**：
1. 检查后端服务是否运行：`curl http://localhost:3000/health`
2. 检查 API 代理配置：`vite.config.js` 中的 `proxy` 设置
3. 查看浏览器控制台错误信息

### 问题：创建二级分类失败
**解决方案**：
1. 确保父分类 ID 正确
2. 检查二级分类名称和 slug 是否已存在
3. 查看后端日志获取详细错误信息

### 问题：分类列表为空
**解决方案**：
1. 运行初始化命令：`curl -X POST http://localhost:3000/api/categories/init/default`
2. 检查数据库连接（如果使用 MongoDB）
3. 查看后端日志

## 技术栈

- **后端**：Node.js + Express.js
- **前端**：Vue.js 3 + Pinia
- **数据存储**：内存存储（可扩展为 MongoDB）
- **样式**：Tailwind CSS 4
- **HTTP 客户端**：Fetch API

## 部署注意事项

1. 确保后端 API 端口（3000）可访问
2. 配置 CORS 允许前端域名
3. 初始化默认分类数据
4. 配置数据库连接（生产环境）
5. 设置管理员认证机制

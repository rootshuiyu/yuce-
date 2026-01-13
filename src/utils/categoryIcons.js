/**
 * 现代化分类图标配置
 * 使用高端、专业的图标设计
 */

export const modernCategoryIcons = {
  // 一级分类图标
  primary: {
    cat_politics: {
      icon: '🏛️',
      name: '政治',
      color: '#8B5CF6', // 紫色
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      description: '全球政治事件与选举预测'
    },
    cat_sports: {
      icon: '⚽',
      name: '体育',
      color: '#EC4899', // 粉色
      gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
      description: '体育赛事与竞技预测'
    },
    cat_crypto: {
      icon: '₿',
      name: '加密',
      color: '#F59E0B', // 琥珀色
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      description: '加密货币与区块链预测'
    },
    cat_finance: {
      icon: '💰',
      name: '金融',
      color: '#10B981', // 翠绿色
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      description: '金融市场与经济预测'
    },
    cat_tech: {
      icon: '💻',
      name: '科技',
      color: '#06B6D4', // 青色
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      description: '科技创新与行业预测'
    },
    cat_culture: {
      icon: '🎭',
      name: '文化',
      color: '#EF4444', // 红色
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      description: '文化艺术与娱乐预测'
    },
    cat_climate: {
      icon: '🌍',
      name: '气候',
      color: '#14B8A6', // 青绿色
      gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
      description: '气候与环境预测'
    },
    cat_world: {
      icon: '🌐',
      name: '世界',
      color: '#3B82F6', // 蓝色
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      description: '国际事件与地缘政治'
    }
  },

  // 二级分类图标
  secondary: {
    // 政治
    'cat_politics_us': {
      icon: '🇺🇸',
      name: '美国选举',
      color: '#8B5CF6'
    },
    'cat_politics_eu': {
      icon: '🇪🇺',
      name: '欧洲政治',
      color: '#8B5CF6'
    },
    'cat_politics_asia': {
      icon: '🌏',
      name: '亚洲政治',
      color: '#8B5CF6'
    },

    // 体育
    'cat_sports_football': {
      icon: '⚽',
      name: '足球',
      color: '#EC4899'
    },
    'cat_sports_basketball': {
      icon: '🏀',
      name: '篮球',
      color: '#EC4899'
    },
    'cat_sports_tennis': {
      icon: '🎾',
      name: '网球',
      color: '#EC4899'
    },

    // 加密
    'cat_crypto_bitcoin': {
      icon: '₿',
      name: '比特币',
      color: '#F59E0B'
    },
    'cat_crypto_ethereum': {
      icon: 'Ξ',
      name: '以太坊',
      color: '#F59E0B'
    },
    'cat_crypto_defi': {
      icon: '🔗',
      name: 'DeFi',
      color: '#F59E0B'
    },

    // 金融
    'cat_finance_stocks': {
      icon: '📈',
      name: '美股',
      color: '#10B981'
    },
    'cat_finance_forex': {
      icon: '💱',
      name: '外汇',
      color: '#10B981'
    },
    'cat_finance_commodities': {
      icon: '🛢️',
      name: '商品',
      color: '#10B981'
    },

    // 科技
    'cat_tech_ai': {
      icon: '🤖',
      name: 'AI',
      color: '#06B6D4'
    },
    'cat_tech_startups': {
      icon: '🚀',
      name: '创业',
      color: '#06B6D4'
    },
    'cat_tech_internet': {
      icon: '🌐',
      name: '互联网',
      color: '#06B6D4'
    },

    // 文化
    'cat_culture_movies': {
      icon: '🎬',
      name: '电影',
      color: '#EF4444'
    },
    'cat_culture_music': {
      icon: '🎵',
      name: '音乐',
      color: '#EF4444'
    },
    'cat_culture_awards': {
      icon: '🏆',
      name: '奖项',
      color: '#EF4444'
    },

    // 气候
    'cat_climate_environment': {
      icon: '🌱',
      name: '环保',
      color: '#14B8A6'
    },
    'cat_climate_weather': {
      icon: '⛅',
      name: '天气',
      color: '#14B8A6'
    },

    // 世界
    'cat_world_geopolitics': {
      icon: '🗺️',
      name: '地缘政治',
      color: '#3B82F6'
    },
    'cat_world_international': {
      icon: '🤝',
      name: '国际事件',
      color: '#3B82F6'
    }
  }
};

/**
 * 获取分类图标配置
 */
export function getCategoryIcon(categoryId, type = 'primary') {
  const icons = modernCategoryIcons[type];
  return icons?.[categoryId] || {
    icon: '📁',
    name: '未知分类',
    color: '#9CA3AF',
    gradient: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
  };
}

/**
 * 获取分类颜色
 */
export function getCategoryColor(categoryId) {
  const icon = getCategoryIcon(categoryId, 'primary');
  return icon.color;
}

/**
 * 获取分类渐变色
 */
export function getCategoryGradient(categoryId) {
  const icon = getCategoryIcon(categoryId, 'primary');
  return icon.gradient;
}

// SEO 和元数据优化
export const updateMetaTags = (title, description, image = null, url = null) => {
  // 更新标题
  document.title = title

  // 更新或创建 meta 标签
  updateMetaTag('description', description)
  updateMetaTag('og:title', title)
  updateMetaTag('og:description', description)
  updateMetaTag('twitter:title', title)
  updateMetaTag('twitter:description', description)

  if (image) {
    updateMetaTag('og:image', image)
    updateMetaTag('twitter:image', image)
  }

  if (url) {
    updateMetaTag('og:url', url)
    updateMetaTag('canonical', url, 'link')
  }
}

const updateMetaTag = (name, content, type = 'meta') => {
  let tag = document.querySelector(`${type}[name="${name}"], ${type}[property="${name}"]`)

  if (!tag) {
    tag = document.createElement(type)
    if (type === 'meta') {
      tag.setAttribute(name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name', name)
    } else if (type === 'link') {
      tag.setAttribute('rel', name)
    }
    document.head.appendChild(tag)
  }

  if (type === 'meta') {
    tag.setAttribute('content', content)
  } else if (type === 'link') {
    tag.setAttribute('href', content)
  }
}

export const generateStructuredData = (data) => {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

export const marketStructuredData = (market) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name: market.question,
    description: market.description,
    url: `${window.location.origin}/market/${market.id}`,
    image: market.image || null,
    dateCreated: market.createdAt,
    dateModified: market.updatedAt,
  }
}

const searchTerms = {
  '杭州': ['west lake', 'hangzhou', 'china lake'],
  '北京': ['beijing', 'great wall', 'chinese architecture'],
  '上海': ['shanghai skyline', 'china city', 'modern city'],
  '西安': ['xian', 'terracotta army', 'ancient china'],
  '厦门': ['xiamen', 'gulangyu', 'island'],
  '丽江': ['lijiang', 'yunnan', 'mountain village'],
  '成都': ['chengdu', 'sichuan', 'china landscape'],
  '广州': ['guangzhou', 'china cityscape', 'modern asia'],
  '张家界': ['zhangjiajie', 'national park', 'china mountains'],
  '桂林': ['guilin', 'karst mountains', 'li river']
}

const fallbackImages = [
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', credit: 'Unsplash', city: 'nature' },
  { url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop', credit: 'Unsplash', city: 'city' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop', credit: 'Unsplash', city: 'beach' },
  { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop', credit: 'Unsplash', city: 'forest' },
  { url: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800&h=600&fit=crop', credit: 'Unsplash', city: 'mountain' },
  { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=600&fit=crop', credit: 'Unsplash', city: 'landscape' },
  { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop', credit: 'Unsplash', city: 'waterfall' },
  { url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop', credit: 'Unsplash', city: 'lake' }
]

export async function getTravelPhotos(query = 'travel', count = 4) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const terms = searchTerms[query] || [query, 'travel', 'landscape']
    const term = terms[Math.floor(Math.random() * terms.length)]
    const response = await fetch(
      `https://picsum.photos/v2/list?page=${Math.floor(Math.random() * 100) + 1}&limit=${count}&query=${encodeURIComponent(term)}`,
      { signal: controller.signal }
    )
    clearTimeout(timer)
    if (!response.ok) throw new Error(`Picsum API ${response.status}`)
    const data = await response.json()
    return data.map(item => ({
      id: item.id,
      url: `https://picsum.photos/id/${item.id}/800/600`,
      author: item.author,
      city: query
    }))
  } catch (error) {
    clearTimeout(timer)
    console.warn('实时图片获取失败，使用备用图库', error)
    const shuffled = [...fallbackImages].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map((item, i) => ({
      id: `${query}-${i}-${Date.now()}`,
      url: item.url,
      author: item.credit,
      city: item.city === 'nature' ? query : item.city
    }))
  }
}

export async function getDailyTravelPhoto(city = '杭州') {
  const photos = await getTravelPhotos(city, 1)
  return photos[0] || fallbackImages[0]
}

export const popularDestinations = Object.keys(searchTerms)
<script setup>
import { ref, onMounted } from 'vue'
import { Image, RefreshCw, Heart, Share2, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { getTravelPhotos, popularDestinations } from '../services/unsplash'

const photos = ref([])
const loading = ref(false)
const selectedCity = ref('杭州')
const likedPhotos = ref(new Set())
const showLightbox = ref(false)
const currentIndex = ref(0)

const loadPhotos = async (city = selectedCity.value) => {
  loading.value = true
  try {
    photos.value = await getTravelPhotos(city, 4)
  } catch (e) {
    ElMessage.warning('图片加载失败，稍后重试')
  } finally {
    loading.value = false
  }
}

const toggleLike = (id) => {
  if (likedPhotos.value.has(id)) {
    likedPhotos.value.delete(id)
    ElMessage.info('已取消收藏')
  } else {
    likedPhotos.value.add(id)
    ElMessage.success('已收藏')
  }
  likedPhotos.value = new Set(likedPhotos.value)
}

const share = async (photo) => {
  const text = `发现一张${photo.city}的美景，来自云迹旅行。`
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('分享文案已复制')
  } catch {
    ElMessage.info(text)
  }
}

const openLightbox = (index) => {
  currentIndex.value = index
  showLightbox.value = true
}

const closeLightbox = () => {
  showLightbox.value = false
}

const prevPhoto = () => {
  currentIndex.value = (currentIndex.value - 1 + photos.value.length) % photos.value.length
}

const nextPhoto = () => {
  currentIndex.value = (currentIndex.value + 1) % photos.value.length
}

onMounted(loadPhotos)
</script>

<template>
  <section class="travel-gallery">
    <div class="gallery-header">
      <div class="gallery-info">
        <span><Image :size="16" /> PICSUM LIVE API</span>
        <h2>目的地风景</h2>
        <p>精选旅行目的地的实时风景照片，感受远方的美好。</p>
      </div>
      <div class="gallery-controls">
        <el-select v-model="selectedCity" @change="loadPhotos" class="city-select">
          <el-option v-for="city in popularDestinations" :key="city" :label="city" :value="city" />
        </el-select>
        <button @click="loadPhotos" :disabled="loading" class="refresh-btn">
          <RefreshCw :class="{ spin: loading }" :size="16" />
          {{ loading ? '加载中…' : '刷新' }}
        </button>
      </div>
    </div>

    <div class="gallery-grid" :class="{ loading }">
      <div v-if="loading" class="skeleton-card" v-for="i in 4" :key="i">
        <div class="skeleton-img"></div>
        <div class="skeleton-info">
          <div class="skeleton-line"></div>
          <div class="skeleton-line small"></div>
        </div>
      </div>

      <div v-for="(photo, index) in photos" :key="photo.id" class="photo-card" @click="openLightbox(index)">
        <div class="photo-wrapper">
          <img :src="photo.url" :alt="photo.city" class="photo-img" />
          <div class="photo-overlay">
            <div class="photo-tags">
              <span><MapPin :size="12" /> {{ photo.city }}</span>
            </div>
            <div class="photo-actions">
              <button @click.stop="toggleLike(photo.id)" :class="{ liked: likedPhotos.has(photo.id) }">
                <Heart :fill="likedPhotos.has(photo.id) ? 'currentColor' : 'none'" :size="18" />
              </button>
              <button @click.stop="share(photo)">
                <Share2 :size="18" />
              </button>
            </div>
          </div>
        </div>
        <div class="photo-info">
          <small>摄影师: {{ photo.author }}</small>
          <span>{{ photo.city }}</span>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showLightbox" class="lightbox-overlay" @click="closeLightbox">
        <div class="lightbox-content" @click.stop>
          <button class="lightbox-close" @click="closeLightbox">
            <X :size="24" />
          </button>
          <button class="lightbox-prev" @click="prevPhoto" v-if="photos.length > 1">
            <ChevronLeft :size="32" />
          </button>
          <img :src="photos[currentIndex]?.url" :alt="photos[currentIndex]?.city" class="lightbox-img" />
          <button class="lightbox-next" @click="nextPhoto" v-if="photos.length > 1">
            <ChevronRight :size="32" />
          </button>
          <div class="lightbox-info">
            <span>{{ photos[currentIndex]?.city }}</span>
            <small>{{ currentIndex + 1 }} / {{ photos.length }}</small>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>